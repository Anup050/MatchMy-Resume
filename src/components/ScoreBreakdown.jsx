import React from 'react';
import { FiPieChart, FiAward, FiBriefcase, FiBook, FiHash } from 'react-icons/fi';

const ScoreBreakdown = ({ breakdown }) => {
  const sections = [
    { name: 'skills', icon: <FiAward className="text-blue-500" />, label: 'Skills' },
    { name: 'experience', icon: <FiBriefcase className="text-green-500" />, label: 'Experience' },
    { name: 'education', icon: <FiBook className="text-purple-500" />, label: 'Education' },
    { name: 'keywords', icon: <FiHash className="text-yellow-500" />, label: 'Keywords' },
  ];

  const getSafeScore = (name) => {
    if (!breakdown || typeof breakdown !== 'object') return 0;
    const raw = breakdown[name];
    const num = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isNaN(num)) return 0;
    return Math.min(Math.max(num, 0), 100); // clamp 0–100
  };

  const getBarColor = (score) => {
    if (score > 75) return '#10B981'; // green
    if (score > 50) return '#3B82F6'; // blue
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <FiPieChart className="text-gray-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Score Breakdown</h3>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const score = getSafeScore(section.name);
          return (
            <div key={section.name} className="flex items-center">
              <div className="mr-3">
                {section.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{section.label}</span>
                  <span className="font-medium">{score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getBarColor(score),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="mr-2 w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500">75–100%: Strong match</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="mr-2 w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-500">50–74%: Moderate match</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="mr-2 w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-500">Below 50%: Needs improvement</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
