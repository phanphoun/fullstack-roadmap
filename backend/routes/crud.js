import express from 'express';
import { protect } from '../middleware/auth.js';
import { runQuery, runQuerySingle, runQueryUpdate } from '../database/sqlite.js';

const router = express.Router();

// All CRUD routes require authentication
router.use(protect);

// Phase CRUD Operations
router.post('/phases', async (req, res) => {
    try {
        const { title, description, order, color, icon } = req.body;

        const query = `
      INSERT INTO custom_phases (
        userId, title, description, order, color, icon, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

        const result = runQueryUpdate(query, [
            req.user.id, title, description, order, color, icon
        ]);

        res.status(201).json({
            success: true,
            data: { id: result.lastInsertRowid, title, description, order, color, icon }
        });
    } catch (error) {
        console.error('Create phase error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create phase'
        });
    }
});

router.get('/phases', async (req, res) => {
    try {
        const query = `
      SELECT * FROM custom_phases 
      WHERE userId = ? 
      ORDER BY order ASC, createdAt ASC
    `;

        const phases = runQuery(query, [req.user.id]);

        res.status(200).json({
            success: true,
            data: phases
        });
    } catch (error) {
        console.error('Get phases error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch phases'
        });
    }
});

router.put('/phases/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, order, color, icon } = req.body;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM custom_phases WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Phase not found'
            });
        }

        const query = `
      UPDATE custom_phases 
      SET title = ?, description = ?, order = ?, color = ?, icon = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?
    `;

        runQueryUpdate(query, [title, description, order, color, icon, id, req.user.id]);

        res.status(200).json({
            success: true,
            data: { id, title, description, order, color, icon }
        });
    } catch (error) {
        console.error('Update phase error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update phase'
        });
    }
});

router.delete('/phases/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM custom_phases WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Phase not found'
            });
        }

        // Delete phase and related sections/items
        runQueryUpdate('DELETE FROM custom_items WHERE phaseId = ? AND userId = ?', [id, req.user.id]);
        runQueryUpdate('DELETE FROM custom_sections WHERE phaseId = ? AND userId = ?', [id, req.user.id]);
        runQueryUpdate('DELETE FROM custom_phases WHERE id = ? AND userId = ?', [id, req.user.id]);

        res.status(200).json({
            success: true,
            message: 'Phase deleted successfully'
        });
    } catch (error) {
        console.error('Delete phase error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete phase'
        });
    }
});

// Section CRUD Operations
router.post('/sections', async (req, res) => {
    try {
        const { phaseId, title, description, order } = req.body;

        // Verify phase ownership
        const phase = runQuerySingle('SELECT id FROM custom_phases WHERE id = ? AND userId = ?', [phaseId, req.user.id]);
        if (!phase) {
            return res.status(404).json({
                success: false,
                message: 'Phase not found'
            });
        }

        const query = `
      INSERT INTO custom_sections (
        userId, phaseId, title, description, order, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

        const result = runQueryUpdate(query, [
            req.user.id, phaseId, title, description, order
        ]);

        res.status(201).json({
            success: true,
            data: { id: result.lastInsertRowid, phaseId, title, description, order }
        });
    } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create section'
        });
    }
});

router.get('/sections/:phaseId', async (req, res) => {
    try {
        const { phaseId } = req.params;

        // Verify phase ownership
        const phase = runQuerySingle('SELECT id FROM custom_phases WHERE id = ? AND userId = ?', [phaseId, req.user.id]);
        if (!phase) {
            return res.status(404).json({
                success: false,
                message: 'Phase not found'
            });
        }

        const query = `
      SELECT * FROM custom_sections 
      WHERE userId = ? AND phaseId = ? 
      ORDER BY order ASC, createdAt ASC
    `;

        const sections = runQuery(query, [req.user.id, phaseId]);

        res.status(200).json({
            success: true,
            data: sections
        });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sections'
        });
    }
});

router.put('/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, order } = req.body;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM custom_sections WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        const query = `
      UPDATE custom_sections 
      SET title = ?, description = ?, order = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?
    `;

        runQueryUpdate(query, [title, description, order, id, req.user.id]);

        res.status(200).json({
            success: true,
            data: { id, title, description, order }
        });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update section'
        });
    }
});

router.delete('/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM custom_sections WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Delete section and related items
        runQueryUpdate('DELETE FROM custom_items WHERE sectionId = ? AND userId = ?', [id, req.user.id]);
        runQueryUpdate('DELETE FROM custom_sections WHERE id = ? AND userId = ?', [id, req.user.id]);

        res.status(200).json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete section'
        });
    }
});

// Item CRUD Operations
router.post('/items', async (req, res) => {
    try {
        const { phaseId, sectionId, title, description, url, difficulty, estimatedTime, tags, resources } = req.body;

        // Verify section ownership
        const section = runQuerySingle('SELECT id FROM custom_sections WHERE id = ? AND userId = ?', [sectionId, req.user.id]);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        const query = `
      INSERT INTO custom_items (
        userId, phaseId, sectionId, title, description, url, difficulty, estimatedTime, 
        tags, resources, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

        const result = runQueryUpdate(query, [
            req.user.id, phaseId, sectionId, title, description, url, difficulty,
            estimatedTime, JSON.stringify(tags || []), JSON.stringify(resources || [])
        ]);

        res.status(201).json({
            success: true,
            data: { id: result.lastInsertRowid, phaseId, sectionId, title, description, url, difficulty, estimatedTime, tags, resources }
        });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create item'
        });
    }
});

router.get('/items/:sectionId', async (req, res) => {
    try {
        const { sectionId } = req.params;

        // Verify section ownership
        const section = runQuerySingle('SELECT id FROM custom_sections WHERE id = ? AND userId = ?', [sectionId, req.user.id]);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        const query = `
      SELECT * FROM custom_items 
      WHERE userId = ? AND sectionId = ? 
      ORDER BY createdAt ASC
    `;

        const items = runQuery(query, [req.user.id, sectionId]);

        // Parse JSON fields
        const parsedItems = items.map(item => ({
            ...item,
            tags: JSON.parse(item.tags || '[]'),
            resources: JSON.parse(item.resources || '[]')
        }));

        res.status(200).json({
            success: true,
            data: parsedItems
        });
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch items'
        });
    }
});

router.put('/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, url, difficulty, estimatedTime, tags, resources } = req.body;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM custom_items WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        const query = `
      UPDATE custom_items 
      SET title = ?, description = ?, url = ?, difficulty = ?, estimatedTime = ?, 
          tags = ?, resources = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?
    `;

        runQueryUpdate(query, [
            title, description, url, difficulty, estimatedTime,
            JSON.stringify(tags || []), JSON.stringify(resources || []), id, req.user.id
        ]);

        res.status(200).json({
            success: true,
            data: { id, title, description, url, difficulty, estimatedTime, tags, resources }
        });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update item'
        });
    }
});

router.delete('/items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM custom_items WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        runQueryUpdate('DELETE FROM custom_items WHERE id = ? AND userId = ?', [id, req.user.id]);

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete item'
        });
    }
});

// User Notes CRUD
router.post('/notes', async (req, res) => {
    try {
        const { itemId, content, isPrivate } = req.body;

        const query = `
      INSERT INTO user_notes (
        userId, itemId, content, isPrivate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

        const result = runQueryUpdate(query, [req.user.id, itemId, content, isPrivate]);

        res.status(201).json({
            success: true,
            data: { id: result.lastInsertRowid, itemId, content, isPrivate }
        });
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create note'
        });
    }
});

router.get('/notes/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;

        const query = `
      SELECT * FROM user_notes 
      WHERE userId = ? AND itemId = ? 
      ORDER BY createdAt DESC
    `;

        const notes = runQuery(query, [req.user.id, itemId]);

        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes'
        });
    }
});

router.put('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isPrivate } = req.body;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM user_notes WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        const query = `
      UPDATE user_notes 
      SET content = ?, isPrivate = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?
    `;

        runQueryUpdate(query, [content, isPrivate, id, req.user.id]);

        res.status(200).json({
            success: true,
            data: { id, content, isPrivate }
        });
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update note'
        });
    }
});

router.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existing = runQuerySingle('SELECT id FROM user_notes WHERE id = ? AND userId = ?', [id, req.user.id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        runQueryUpdate('DELETE FROM user_notes WHERE id = ? AND userId = ?', [id, req.user.id]);

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete note'
        });
    }
});

export default router;
