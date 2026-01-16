import apiService from './api.js';

class CRUDService {
    // Roadmap CRUD Operations

    // Create new phase
    static async createPhase(phaseData) {
        try {
            const response = await apiService.post('/roadmap/phases', phaseData);
            return response;
        } catch (error) {
            console.error('Error creating phase:', error);
            throw error;
        }
    }

    // Get all phases
    static async getPhases() {
        try {
            const response = await apiService.get('/roadmap/phases');
            return response;
        } catch (error) {
            console.error('Error fetching phases:', error);
            throw error;
        }
    }

    // Update phase
    static async updatePhase(phaseId, phaseData) {
        try {
            const response = await apiService.put(`/roadmap/phases/${phaseId}`, phaseData);
            return response;
        } catch (error) {
            console.error('Error updating phase:', error);
            throw error;
        }
    }

    // Delete phase
    static async deletePhase(phaseId) {
        try {
            const response = await apiService.delete(`/roadmap/phases/${phaseId}`);
            return response;
        } catch (error) {
            console.error('Error deleting phase:', error);
            throw error;
        }
    }

    // Section CRUD Operations

    // Create new section
    static async createSection(sectionData) {
        try {
            const response = await apiService.post('/roadmap/sections', sectionData);
            return response;
        } catch (error) {
            console.error('Error creating section:', error);
            throw error;
        }
    }

    // Update section
    static async updateSection(sectionId, sectionData) {
        try {
            const response = await apiService.put(`/roadmap/sections/${sectionId}`, sectionData);
            return response;
        } catch (error) {
            console.error('Error updating section:', error);
            throw error;
        }
    }

    // Delete section
    static async deleteSection(sectionId) {
        try {
            const response = await apiService.delete(`/roadmap/sections/${sectionId}`);
            return response;
        } catch (error) {
            console.error('Error deleting section:', error);
            throw error;
        }
    }

    // Item CRUD Operations

    // Create new item
    static async createItem(itemData) {
        try {
            const response = await apiService.post('/roadmap/items', itemData);
            return response;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    // Update item
    static async updateItem(itemId, itemData) {
        try {
            const response = await apiService.put(`/roadmap/items/${itemId}`, itemData);
            return response;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }

    // Delete item
    static async deleteItem(itemId) {
        try {
            const response = await apiService.delete(`/roadmap/items/${itemId}`);
            return response;
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }

    // User Generated Content CRUD

    // Create user note
    static async createUserNote(noteData) {
        try {
            const response = await apiService.post('/user/notes', noteData);
            return response;
        } catch (error) {
            console.error('Error creating user note:', error);
            throw error;
        }
    }

    // Get user notes
    static async getUserNotes(itemId) {
        try {
            const response = await apiService.get(`/user/notes/${itemId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user notes:', error);
            throw error;
        }
    }

    // Update user note
    static async updateUserNote(noteId, noteData) {
        try {
            const response = await apiService.put(`/user/notes/${noteId}`, noteData);
            return response;
        } catch (error) {
            console.error('Error updating user note:', error);
            throw error;
        }
    }

    // Delete user note
    static async deleteUserNote(noteId) {
        try {
            const response = await apiService.delete(`/user/notes/${noteId}`);
            return response;
        } catch (error) {
            console.error('Error deleting user note:', error);
            throw error;
        }
    }

    // Create user rating
    static async createUserRating(ratingData) {
        try {
            const response = await apiService.post('/user/ratings', ratingData);
            return response;
        } catch (error) {
            console.error('Error creating user rating:', error);
            throw error;
        }
    }

    // Update user rating
    static async updateUserRating(ratingId, ratingData) {
        try {
            const response = await apiService.put(`/user/ratings/${ratingId}`, ratingData);
            return response;
        } catch (error) {
            console.error('Error updating user rating:', error);
            throw error;
        }
    }

    // Get user ratings
    static async getUserRatings(itemId) {
        try {
            const response = await apiService.get(`/user/ratings/${itemId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user ratings:', error);
            throw error;
        }
    }

    // Create user bookmark
    static async createUserBookmark(bookmarkData) {
        try {
            const response = await apiService.post('/user/bookmarks', bookmarkData);
            return response;
        } catch (error) {
            console.error('Error creating user bookmark:', error);
            throw error;
        }
    }

    // Get user bookmarks
    static async getUserBookmarks() {
        try {
            const response = await apiService.get('/user/bookmarks');
            return response;
        } catch (error) {
            console.error('Error fetching user bookmarks:', error);
            throw error;
        }
    }

    // Delete user bookmark
    static async deleteUserBookmark(bookmarkId) {
        try {
            const response = await apiService.delete(`/user/bookmarks/${bookmarkId}`);
            return response;
        } catch (error) {
            console.error('Error deleting user bookmark:', error);
            throw error;
        }
    }

    // Create user collection
    static async createUserCollection(collectionData) {
        try {
            const response = await apiService.post('/user/collections', collectionData);
            return response;
        } catch (error) {
            console.error('Error creating user collection:', error);
            throw error;
        }
    }

    // Get user collections
    static async getUserCollections() {
        try {
            const response = await apiService.get('/user/collections');
            return response;
        } catch (error) {
            console.error('Error fetching user collections:', error);
            throw error;
        }
    }

    // Update user collection
    static async updateUserCollection(collectionId, collectionData) {
        try {
            const response = await apiService.put(`/user/collections/${collectionId}`, collectionData);
            return response;
        } catch (error) {
            console.error('Error updating user collection:', error);
            throw error;
        }
    }

    // Delete user collection
    static async deleteUserCollection(collectionId) {
        try {
            const response = await apiService.delete(`/user/collections/${collectionId}`);
            return response;
        } catch (error) {
            console.error('Error deleting user collection:', error);
            throw error;
        }
    }

    // Add item to collection
    static async addItemToCollection(collectionId, itemId) {
        try {
            const response = await apiService.post(`/user/collections/${collectionId}/items`, { itemId });
            return response;
        } catch (error) {
            console.error('Error adding item to collection:', error);
            throw error;
        }
    }

    // Remove item from collection
    static async removeItemFromCollection(collectionId, itemId) {
        try {
            const response = await apiService.delete(`/user/collections/${collectionId}/items/${itemId}`);
            return response;
        } catch (error) {
            console.error('Error removing item from collection:', error);
            throw error;
        }
    }

    // Comment System

    // Create comment
    static async createComment(commentData) {
        try {
            const response = await apiService.post('/comments', commentData);
            return response;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    // Get comments for item
    static async getComments(itemId, page = 1, limit = 10) {
        try {
            const response = await apiService.get(`/comments/${itemId}?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    // Update comment
    static async updateComment(commentId, commentData) {
        try {
            const response = await apiService.put(`/comments/${commentId}`, commentData);
            return response;
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        }
    }

    // Delete comment
    static async deleteComment(commentId) {
        try {
            const response = await apiService.delete(`/comments/${commentId}`);
            return response;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    // Like/Unlike functionality
    static async likeItem(itemId) {
        try {
            const response = await apiService.post(`/items/${itemId}/like`);
            return response;
        } catch (error) {
            console.error('Error liking item:', error);
            throw error;
        }
    }

    static async unlikeItem(itemId) {
        try {
            const response = await apiService.delete(`/items/${itemId}/like`);
            return response;
        } catch (error) {
            console.error('Error unliking item:', error);
            throw error;
        }
    }

    // Get item likes
    static async getItemLikes(itemId) {
        try {
            const response = await apiService.get(`/items/${itemId}/likes`);
            return response;
        } catch (error) {
            console.error('Error fetching item likes:', error);
            throw error;
        }
    }
}

export default CRUDService;
