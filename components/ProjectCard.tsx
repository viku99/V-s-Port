// 📇 Project Card Component
// This component displays a single project thumbnail in the portfolio grid.
// In edit mode, it shows controls for editing, deleting, and reordering.

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { useEditor } from './EditorProvider';
import Icon from './Icon';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

const getCardSpan = (index: number) => {
    if ((index + 1) % 7 === 0) return 'lg:col-span-2';
    return 'lg:col-span-1';
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const { isEditMode, updateSiteContent } = useEditor();
  const fallbackThumbnail = `https://picsum.photos/seed/${project.id}/800/600`;

  const handleDelete = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
          updateSiteContent(draft => {
              draft.projects = draft.projects.filter(p => p.id !== project.id);
          });
      }
  };

  const handleEdit = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Logic to open an edit modal would go here
      alert(`Editing "${project.title}"... (modal not implemented yet)`);
  }

  return (
    <motion.div
      className={`group relative aspect-video overflow-hidden rounded-lg ${getCardSpan(index)}`}
      variants={cardVariants}
    >
      {isEditMode && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={handleEdit} className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors"><Icon name="edit" /></button>
              <button onClick={handleDelete} className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"><Icon name="delete" /></button>
          </div>
      )}
      <Link to={`/portfolio/${project.id}`} className="block w-full h-full">
        <img
          src={project.thumbnail || fallbackThumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-500 group-hover:bg-opacity-70" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div
            className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <h3 className="text-xl font-bold uppercase">{project.title}</h3>
            <p className="text-sm text-neutral-300">{project.category}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;