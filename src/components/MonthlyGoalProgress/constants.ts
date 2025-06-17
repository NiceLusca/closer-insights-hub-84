
export const MONTHLY_GOAL = 50000; // Meta de R$ 50.000

export const getCloserColor = (index: number) => {
  const colors = [
    'text-blue-400',
    'text-green-400', 
    'text-purple-400',
    'text-yellow-400',
    'text-pink-400',
    'text-cyan-400',
    'text-orange-400'
  ];
  return colors[index % colors.length];
};
