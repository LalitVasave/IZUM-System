import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ETACardProps {
  id: string;
  name: string;
  eta: string;
  distance: string;
  status: 'LEAVE_NOW' | 'LEAVE_SOON' | 'WAIT';
}

const ETACard: React.FC<ETACardProps> = ({ id, name, eta, distance, status }) => {
  const navigate = useNavigate();

  const statusColors = {
    LEAVE_NOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    LEAVE_SOON: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    WAIT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const statusLabels = {
    LEAVE_NOW: 'LEAVE NOW',
    LEAVE_SOON: 'LEAVE SOON',
    WAIT: 'WAITING',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/eta/${id}`)}
      className="glass-panel p-4 rounded-2xl cursor-pointer border border-white/5 flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="text-primary w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{name}</h3>
            <p className="text-white/40 text-xs">{distance}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md text-[10px] font-bold border ${statusColors[status]}`}>
          {statusLabels[status]}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <Clock className="text-white/40 w-4 h-4" />
          <span className="text-2xl font-bold text-white">{eta}</span>
          <span className="text-white/40 text-xs self-end mb-1">mins</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Zap className="w-3 h-3 fill-current" />
          <span className="text-[10px] font-medium tracking-wider">PREDICTED</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ETACard;
