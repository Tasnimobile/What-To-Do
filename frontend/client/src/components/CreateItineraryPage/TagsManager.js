// TagsManager.js
import React from 'react';
import './TagsManager.css';

function TagsManager({ itineraryData, onUpdate }) {
    const handleAddTag = () => {
        if (itineraryData.customTag.trim() && !itineraryData.tags.includes(itineraryData.customTag.trim())) {
            const updatedTags = [...itineraryData.tags, itineraryData.customTag.trim()];
            onUpdate('tags', updatedTags);
            onUpdate('customTag', '');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        const updatedTags = itineraryData.tags.filter(tag => tag !== tagToRemove);
        onUpdate('tags', updatedTags);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    };

    return (
        <div className="input-group">
            <label className="form-label">Tags</label>
            <div className="tags-section">
                <div className="tags-input-container">
                    <input
                        type="text"
                        placeholder="Add tags..."
                        value={itineraryData.customTag}
                        onChange={(e) => onUpdate('customTag', e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="tags-input"
                    />
                    <button
                        onClick={handleAddTag}
                        className="add-tag-btn"
                    >
                        Add
                    </button>
                </div>
                <div className="tags-display">
                    {itineraryData.tags.map(tag => (
                        <span key={tag} className="tag-item">
                            {tag}
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="remove-tag-btn"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TagsManager;