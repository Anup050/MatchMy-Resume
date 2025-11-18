import React, { useState, useEffect, useMemo } from 'react';
import { FiEdit, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

const ResumeEditor = ({ originalText, sectionFeedback }) => {
  const [text, setText] = useState(originalText || '');
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState([]);

  // Keep local text in sync when originalText changes (e.g. new PDF uploaded)
  useEffect(() => {
    setText(originalText || '');
  }, [originalText]);

  const applySuggestion = (suggestion) => {
    if (!suggestion?.fromText) return;

    // Simple implementation - in production you'd want more sophisticated text replacement
    const newText = text.replace(suggestion.fromText, suggestion.toText || '');
    setText(newText);
    setAppliedSuggestions((prev) => [...prev, suggestion.id]);
    setActiveSuggestion(null);
  };

  // Safely compute suggestions from sectionFeedback
  const allSuggestions = useMemo(() => {
    const suggestions = [];

    if (!sectionFeedback || typeof sectionFeedback !== 'object') {
      return suggestions;
    }

    Object.entries(sectionFeedback).forEach(([section, feedbacks]) => {
      if (!Array.isArray(feedbacks)) return;

      feedbacks.forEach((feedback, index) => {
        if (typeof feedback !== 'string') return;

        // This is simplified - you'd want proper NLP to identify text ranges
        const fromMatch = feedback.match(/"(.*?)"/)?.[1];
        const toMatch = feedback.match(/→\s*"(.*?)"/)?.[1];

        const parts = feedback.split('→');
        const fallbackFrom = parts[0]?.trim();
        const fallbackTo = parts[1]?.trim();

        const fromText = fromMatch || fallbackFrom;
        const toText = toMatch || fallbackTo;

        if (fromText && toText) {
          suggestions.push({
            id: `${section}-${index}`,
            section,
            fromText,
            toText,
            feedback,
          });
        }
      });
    });

    return suggestions;
  }, [sectionFeedback]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <FiEdit className="text-gray-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Interactive Resume Editor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Editor Panel */}
        <div className="p-4 border-r border-gray-200">
          <div className="relative h-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              placeholder="Your resume text..."
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-500">
              {text.length} characters
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Improvements</h4>

          {allSuggestions.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-gray-400">
              No suggestions available
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allSuggestions.map((suggestion) => {
                const isApplied = appliedSuggestions.includes(suggestion.id);
                const isActive = activeSuggestion?.id === suggestion.id;

                return (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-lg border ${
                      isApplied
                        ? 'border-green-200 bg-green-50'
                        : isActive
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        {isApplied ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiAlertTriangle className="text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {suggestion.section.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.feedback}</p>
                        {!isApplied && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => applySuggestion(suggestion)}
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Apply Change
                            </button>
                            <button
                              onClick={() =>
                                setActiveSuggestion(isActive ? null : suggestion)
                              }
                              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              {isActive ? 'Hide' : 'Show'} in Text
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
