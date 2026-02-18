
import React, { useState } from 'react';
import { X, CheckCircle, Award, Clock, Search } from 'lucide-react';
import { MOCK_TRAINERS } from '../constants';
import { TrainerCard } from '../components/TrainerCard';
import { Trainer } from '../types';

export const Trainers: React.FC = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  
  // Directly show all trainers without filtering
  const allTrainers = MOCK_TRAINERS;

  return (
    <div className="pt-8 md:pt-4 pb-16 px-6 min-h-screen bg-gray-50">
      
      {/* Static Header */}
      <div className="mb-8 mt-2 md:mt-0">
         <h1 className="text-3xl font-extrabold text-secondary">Our Trainers</h1>
         <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-wide">Meet our certified professionals</p>
      </div>

      <div className="mt-6 animate-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{allTrainers.length} professionals nearby</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allTrainers.map(trainer => (
                <TrainerCard 
                    key={trainer.id} 
                    trainer={trainer}
                    onClick={() => setSelectedTrainer(trainer)}
                />
            ))}
         </div>
      </div>

      {/* Trainer Modal */}
      {selectedTrainer && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full md:max-w-2xl rounded-t-[40px] md:rounded-[40px] overflow-hidden max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300 relative">
                  <button 
                    onClick={() => setSelectedTrainer(null)}
                    className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white md:text-secondary md:bg-gray-100 hover:bg-white transition-colors"
                  >
                      <X size={20} />
                  </button>
                  
                  {/* Modal Header Image */}
                  <div className="relative h-64 md:h-80 w-full">
                      <img src={selectedTrainer.imageUrl} className="w-full h-full object-cover" alt={selectedTrainer.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                          <h2 className="text-3xl font-black mb-1">{selectedTrainer.name}</h2>
                          <div className="flex gap-2 text-sm font-medium opacity-90">
                              <span>Verified Trainer</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Modal Content */}
                  <div className="p-8 space-y-8 bg-white pb-12">
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-2 text-primary mb-1">
                                  <Clock size={18} />
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Experience</span>
                              </div>
                              <span className="text-lg font-bold text-secondary">{selectedTrainer.experience}+ Years</span>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-2 text-primary mb-1">
                                  <Award size={18} />
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Certified</span>
                              </div>
                              <span className="text-lg font-bold text-secondary">Pro Trainer</span>
                          </div>
                      </div>

                      {/* Bio */}
                      <div>
                          <h3 className="text-lg font-bold text-secondary mb-3">About</h3>
                          <p className="text-gray-500 leading-relaxed text-sm">
                              {selectedTrainer.bio}
                          </p>
                      </div>

                      {/* Specialties */}
                      <div>
                          <h3 className="text-lg font-bold text-secondary mb-3">Expertise</h3>
                          <div className="flex flex-wrap gap-2">
                              {selectedTrainer.specialties.map(s => (
                                  <span key={s} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                                      {s}
                                  </span>
                              ))}
                          </div>
                      </div>
                      
                      {/* Certifications */}
                      {selectedTrainer.certifications && (
                          <div>
                            <h3 className="text-lg font-bold text-secondary mb-3">Certifications</h3>
                            <ul className="space-y-2">
                                {selectedTrainer.certifications.map(c => (
                                    <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
