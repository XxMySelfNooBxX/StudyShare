import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment } from '../types';
import { useKanban } from '../context/KanbanContext';

interface CommentThreadProps {
  taskId: string;
  comments: Comment[];
}

export const CommentThread: React.FC<CommentThreadProps> = ({ taskId, comments }) => {
  const { addComment, deleteComment } = useKanban();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(taskId, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Comments</h3>
      
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 relative">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-gray-900">
                    {comment.author?.name || 'Unknown User'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                <button
                  onClick={() => deleteComment(taskId, comment.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
          {comments.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">No comments yet.</div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleAddComment} className="flex gap-2 items-end">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 resize-none h-16"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors h-10"
        >
          Send
        </button>
      </form>
    </div>
  );
};
