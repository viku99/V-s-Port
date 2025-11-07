// 👤 About Page
// This page provides a personal introduction.
// It includes a short bio, a list of technical skills/tools, and an image.

import React, { useState } from 'react';
// FIX: Import `Variants` type from framer-motion to resolve TypeScript errors with easing strings.
import { motion, AnimatePresence, Reorder, Variants } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useEditor } from '../components/EditorProvider';
import Editable from '../components/Editable';
import { Testimonial } from '../types';
import AddTestimonialModal from '../components/AddTestimonialModal';
import Icon from '../components/Icon';


// FIX: Explicitly type animation variants with `Variants` to ensure type safety for easing properties.
const sectionVariants: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// FIX: Explicitly type animation variants with `Variants` to ensure type safety.
const listVariants: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// FIX: Explicitly type animation variants with `Variants` to ensure type safety for easing properties.
const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};


function AboutPage() {
  const { siteContent, isEditMode, updateSiteContent } = useEditor();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  if (!siteContent) return null;

  const handleDeleteTestimonial = (id: string) => {
      if (window.confirm("Are you sure you want to delete this testimonial?")) {
          updateSiteContent(draft => {
              draft.testimonials = draft.testimonials.filter(t => t.id !== id);
          });
      }
  };
  
  const handleReorderTestimonials = (newOrder: Testimonial[]) => {
      updateSiteContent(draft => {
          draft.testimonials = newOrder;
      });
  }

  const SkillsList = () => (
    <motion.div 
        className="flex flex-wrap gap-2"
        variants={listVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
    >
      <Editable
        path="about.skills"
        render={(skills: string[]) => (
          skills.map((skill) => (
            <motion.span
              key={skill}
              className="bg-neutral-800 text-neutral-300 px-3 py-1 text-sm font-medium rounded-full"
              variants={itemVariants}
            >
              {skill}
            </motion.span>
          ))
        )}
        multiline
        label="Edit Skills (comma separated)"
      />
    </motion.div>
  );
  
  return (
    <>
    <AnimatedPage>
      <div className="min-h-screen p-4 md:p-8 pt-24 md:pt-8">
        <div className="container mx-auto max-w-5xl">
          {/* --- Profile Section --- */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 items-center mb-24"
            variants={sectionVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div
              className="md:col-span-2 group"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(https://picsum.photos/seed/about-me/800/800)` }}
                />
              </div>
            </div>

            <div
              className="md:col-span-3"
            >
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                I'm Vikas.
              </h1>

              <Editable
                  path="about.bio"
                  as="div"
                  className="text-lg md:text-xl text-neutral-300 leading-relaxed mb-8 max-w-prose"
                  multiline
              />
              
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Skills & Tools</h2>
              <SkillsList />
            </div >
          </motion.div>

          {/* --- Testimonials Section --- */}
          <motion.div
            variants={sectionVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="flex justify-center items-center gap-4 mb-12">
                <h2 className="text-4xl font-bold uppercase tracking-wider text-center">
                    What Others Say
                </h2>
                {isEditMode && (
                    <motion.button
                        onClick={() => setEditingTestimonial({} as Testimonial)}
                        className="flex items-center px-4 py-2 text-sm font-bold text-black bg-white rounded-md hover:opacity-90 transition-opacity"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icon name="add" className="mr-2"/> Add
                    </motion.button>
                )}
            </div>
            
            {siteContent.testimonials.length > 0 ? (
                <Reorder.Group 
                  axis="y" 
                  values={siteContent.testimonials} 
                  onReorder={handleReorderTestimonials} 
                  className="space-y-8 max-w-3xl mx-auto"
                >
                  <AnimatePresence initial={false}>
                    {siteContent.testimonials.map((testimonial, index) => (
                      <Reorder.Item 
                        key={testimonial.id} 
                        value={testimonial}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                      >
                        <div
                          className="bg-neutral-900 p-6 rounded-lg flex flex-col relative group border border-neutral-800"
                        >
                          {isEditMode && (
                              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <motion.button whileTap={{ scale: 0.9 }} className="p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500" onClick={() => setEditingTestimonial(testimonial)}><Icon name="edit" /></motion.button>
                                  <motion.button whileTap={{ scale: 0.9 }} className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-500" onClick={() => handleDeleteTestimonial(testimonial.id)}><Icon name="delete" /></motion.button>
                                  <div className="p-1.5 text-neutral-400 cursor-grab active:cursor-grabbing"><Icon name="reorder" /></div>
                              </div>
                          )}
                          <Editable path={`testimonials[${index}].quote`} as="p" className="text-neutral-300 italic flex-grow mb-6" multiline />
                          <div className="flex items-center">
                            <Editable 
                              path={`testimonials[${index}].image`} 
                              type="media"
                              render={src => <img src={src} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 object-cover" />} 
                            />
                            <div>
                              <Editable path={`testimonials[${index}].name`} as="p" className="font-bold text-white" />
                              <Editable path={`testimonials[${index}].title`} as="p" className="text-sm text-neutral-400" />
                            </div>
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
            ) : (
               <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                    <p className="text-neutral-400 text-lg">No testimonials yet.</p>
                    {isEditMode && <p className="text-neutral-500 text-sm mt-2">Click "Add" to get started!</p>}
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
    <AnimatePresence>
        {editingTestimonial && (
            <AddTestimonialModal
                testimonial={editingTestimonial}
                onClose={() => setEditingTestimonial(null)}
            />
        )}
    </AnimatePresence>
    </>
  );
};

export default AboutPage;