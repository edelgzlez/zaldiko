import React from 'react';
import { Building2, Users, Calendar, Bed } from 'lucide-react';

interface HeaderProps {
  totalRooms: number;
  totalBeds: number;
  totalGuests: number;
  occupancyRate: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalRooms, 
  totalBeds, 
  totalGuests, 
  occupancyRate 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zaldiko</h1>
              <p className="text-sm text-gray-600">Gestión de Pensión y Albergue</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Building2 className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-gray-900">{totalRooms}</span>
              </div>
              <p className="text-xs text-gray-600">Habitaciones</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Bed className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-gray-900">{totalBeds}</span>
              </div>
              <p className="text-xs text-gray-600">Camas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-gray-900">{totalGuests}</span>
              </div>
              <p className="text-xs text-gray-600">Huéspedes</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-blue-600">{occupancyRate}%</span>
              </div>
              <p className="text-xs text-gray-600">Ocupación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};