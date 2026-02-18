
import React from 'react';
import { Trainer } from '../types';

interface TrainerCardProps {
  trainer: Trainer;
  onClick?: () => void;
}

export const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className="group bg-white rounded-[28px] p-3 shadow-soft hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full cursor-pointer"
    >
      <div className="relative h-72 w-full overflow-hidden rounded-[20px]">
        <img 
          src={trainer.imageUrl} 
          alt={trainer.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-80"></div>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
                 <h3 className="font-extrabold text-xl text-white mb-1 leading-tight">{trainer.name}</h3>
            </div>
        </div>
      </div>
      
      <div className="mt-4 px-2 pb-2">
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-medium mb-4">{trainer.bio}</p>
          
          <button className="w-full py-3 rounded-xl bg-secondary text-white font-bold text-sm shadow-lg shadow-secondary/20 group-hover:bg-primary group-hover:text-secondary transition-colors">
            View Profile
          </button>
      </div>
    </div>
  );
};
