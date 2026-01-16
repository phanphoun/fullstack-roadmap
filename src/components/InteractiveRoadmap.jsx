import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bookmark, MessageSquare, Star, Clock, Hash, ChevronRight, ChevronDown } from 'lucide-react';
import CRUDService from '../services/crudService.js';
import { useAuth } from '../context/AuthContext';

const InteractiveRoadmap = () => {
    const { user, isAuthenticated } = useAuth();
    const [customPhases, setCustomPhases] = useState([]);
    const [customSections, setCustomSections] = useState({});
    const [customItems, setCustomItems] = useState({});
    const [userNotes, setUserNotes] = useState({});
    const [userRatings, setUserRatings] = useState({});
    const [userBookmarks, setUserBookmarks] = useState([]);
    const [userCollections, setUserCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createMode, setCreateMode] = useState('phase'); // phase, section, item
    const [editingItem, setEditingItem] = useState(null);
    const [expandedPhases, setExpandedPhases] = useState({});
    const [expandedSections, setExpandedSections] = useState({});

    // Fetch user data on mount and when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserData();
        } else {
            // Clear data when logged out
            setCustomPhases([]);
            setCustomSections({});
            setCustomItems({});
            setUserNotes({});
            setUserRatings({});
            setUserBookmarks([]);
            setUserCollections([]);
        }
    }, [isAuthenticated]);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            // Fetch custom phases
            const phasesResponse = await CRUDService.getPhases();
            if (phasesResponse.success) {
                setCustomPhases(phasesResponse.data);

                // Fetch sections for each phase
                const sectionsData = {};
                for (const phase of phasesResponse.data) {
                    const sectionsResponse = await CRUDService.getSections(phase.id);
                    if (sectionsResponse.success) {
                        sectionsData[phase.id] = sectionsResponse.data;
                    }
                }
                setCustomSections(sectionsData);

                // Fetch items for each section
                const itemsData = {};
                for (const phaseId in sectionsData) {
                    for (const section of sectionsData[phaseId]) {
                        const itemsResponse = await CRUDService.getItems(section.id);
                        if (itemsResponse.success) {
                            itemsData[section.id] = itemsResponse.data;
                        }
                    }
                }
                setCustomItems(itemsData);
            }

            // Fetch user collections
            const collectionsResponse = await CRUDService.getUserCollections();
            if (collectionsResponse.success) {
                setUserCollections(collectionsResponse.data);
            }

            // Fetch user bookmarks
            const bookmarksResponse = await CRUDService.getUserBookmarks();
            if (bookmarksResponse.success) {
                setUserBookmarks(bookmarksResponse.data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePhase = async (phaseData) => {
        try {
            const response = await CRUDService.createPhase(phaseData);
            if (response.success) {
                await fetchUserData();
                setShowCreateModal(false);
                setCreateMode('phase');
            }
            return response;
        } catch (error) {
            console.error('Error creating phase:', error);
            throw error;
        }
    };

    const handleCreateSection = async (sectionData) => {
        try {
            const response = await CRUDService.createSection(sectionData);
            if (response.success) {
                await fetchUserData();
                setShowCreateModal(false);
                setCreateMode('section');
            }
            return response;
        } catch (error) {
            console.error('Error creating section:', error);
            throw error;
        }
    };

    const handleCreateItem = async (itemData) => {
        try {
            const response = await CRUDService.createItem(itemData);
            if (response.success) {
                await fetchUserData();
                setShowCreateModal(false);
                setCreateMode('item');
            }
            return response;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    };

    const handleDeletePhase = async (phaseId) => {
        try {
            const response = await CRUDService.deletePhase(phaseId);
            if (response.success) {
                await fetchUserData();
            }
            return response;
        } catch (error) {
            console.error('Error deleting phase:', error);
            throw error;
        }
    };

    const handleDeleteSection = async (sectionId) => {
        try {
            const response = await CRUDService.deleteSection(sectionId);
            if (response.success) {
                await fetchUserData();
            }
            return response;
        } catch (error) {
            console.error('Error deleting section:', error);
            throw error;
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const response = await CRUDService.deleteItem(itemId);
            if (response.success) {
                await fetchUserData();
            }
            return response;
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    };

    const handleCreateNote = async (itemId, content, isPrivate = true) => {
        try {
            const response = await CRUDService.createUserNote({ itemId, content, isPrivate });
            if (response.success) {
                // Refresh notes for this item
                const notesResponse = await CRUDService.getUserNotes(itemId);
                if (notesResponse.success) {
                    setUserNotes(prev => ({
                        ...prev,
                        [itemId]: notesResponse.data
                    }));
                }
            }
            return response;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    };

    const handleCreateRating = async (itemId, rating, review = '') => {
        try {
            const response = await CRUDService.createUserRating({ itemId, rating, review });
            if (response.success) {
                // Refresh ratings for this item
                const ratingsResponse = await CRUDService.getUserRatings(itemId);
                if (ratingsResponse.success) {
                    setUserRatings(prev => ({
                        ...prev,
                        [itemId]: ratingsResponse.data
                    }));
                }
            }
            return response;
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    };

    const handleBookmark = async (itemId) => {
        try {
            const response = await CRUDService.createUserBookmark({ itemId });
            if (response.success) {
                await fetchUserData();
            }
            return response;
        } catch (error) {
            console.error('Error bookmarking item:', error);
            throw error;
        }
    };

    const handleCreateCollection = async (collectionData) => {
        try {
            const response = await CRUDService.createUserCollection(collectionData);
            if (response.success) {
                await fetchUserData();
                setShowCreateModal(false);
            }
            return response;
        } catch (error) {
            console.error('Error creating collection:', error);
            throw error;
        }
    };

    const togglePhaseExpansion = (phaseId) => {
        setExpandedPhases(prev => ({
            ...prev,
            [phaseId]: !prev[phaseId]
        }));
    };

    const toggleSectionExpansion = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const renderCreateModal = () => {
        if (createMode === 'phase') {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            🔐 Authentication Required
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Please log in to access interactive features.
                        </p>
                    </div>
                    );
}

                    return (
                    <div className="space-y-6">
                        {/* Header with actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <Hash className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" />
                                    Interactive Roadmap
                                </h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={fetchUserData}
                                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {customPhases.length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Custom Phases
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                                        {Object.keys(customSections).reduce((acc, phaseId) => acc + (customSections[phaseId]?.length || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Custom Sections
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                                        {Object.keys(customItems).reduce((acc, sectionId) => acc + (customItems[sectionId]?.length || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Custom Items
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-info-600 dark:text-info-400">
                                        {userBookmarks.length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Bookmarks
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Phases */}
                        {customPhases.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    📚 Your Custom Phases
                                </h3>
                                <div className="space-y-4">
                                    {customPhases.map((phase) => (
                                        <div key={phase.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {phase.title}
                                                    </h4>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                                        {phase.description}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => togglePhaseExpansion(phase.id)}
                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                                    >
                                                        {expandedPhases[phase.id] ? <ChevronDown /> : <ChevronRight />}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowCreateModal(true)}
                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePhase(phase.id)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sections */}
                                            {expandedPhases[phase.id] && customSections[phase.id] && (
                                                <div className="ml-8 space-y-4">
                                                    {customSections[phase.id].map((section) => (
                                                        <div key={section.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ml-8">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex-1">
                                                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                                                        {section.title}
                                                                    </h5>
                                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                                                        {section.description}
                                                                    </p>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => toggleSectionExpansion(section.id)}
                                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                                                    >
                                                                        {expandedSections[section.id] ? <ChevronDown /> : <ChevronRight />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setShowCreateModal(true)}
                                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSection(section.id)}
                                                                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Items */}
                                                            {expandedSections[section.id] && customItems[section.id] && (
                                                                <div className="ml-8 space-y-2">
                                                                    {customItems[section.id].map((item) => (
                                                                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 ml-8 border-l-4 border-gray-200 dark:border-gray-600">
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="flex-1">
                                                                                    <h6 className="font-medium text-gray-900 dark:text-white">
                                                                                        {item.title}
                                                                                    </h6>
                                                                                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                                                            {item.difficulty || 'medium'}
                                                                                        </span>
                                                                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                                                                                            {item.estimatedTime || '0'}h
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                                                                                        {item.description}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex space-x-2">
                                                                                    <button
                                                                                        onClick={() => handleCreateNote(item.id, 'My note about this item')}
                                                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                                                                        title="Add note"
                                                                                    >
                                                                                        <MessageSquare className="w-4 h-4" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleCreateRating(item.id, 5)}
                                                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400"
                                                                                        title="Rate item"
                                                                                    >
                                                                                        <Star className="w-4 h-4" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleBookmark(item.id)}
                                                                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                                                                        title="Bookmark"
                                                                                    >
                                                                                        <Bookmark className="w-4 h-4" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                                                        title="Delete item"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                            {/* Notes */}
                                                                            <div className="mt-4 ml-8">
                                                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                                                    Notes ({userNotes[item.id]?.length || 0})
                                                                                </div>
                                                                                {userNotes[item.id]?.map((note) => (
                                                                                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3 ml-8">
                                                                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                                                            {note.content}
                                                                                        </p>
                                                                                        <div className="flex justify-end space-x-2 mt-2">
                                                                                            <button
                                                                                                onClick={() => handleUpdateNote(note.id, note.content)}
                                                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                                                            >
                                                                                                Edit
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteNote(note.id)}
                                                                                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                                                            >
                                                                                                Delete
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                  </div>
                                ))}
                                                                        </div>
                              </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
            ))}
                            </div>
        </div>
)}

                    {/* User Collections */}
                    {
                        userCollections.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    📚 Your Collections
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userCollections.map((collection) => (
                                        <div key={collection.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {collection.name}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {collection.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {collection.isPublic ? '🌐 Public' : '🔒 Private'}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDeleteCollection(collection.id)}
                                                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {/* Create Modal */}
                    {showCreateModal && renderCreateModal()}
                </div >
            );
        };

        export default InteractiveRoadmap;
