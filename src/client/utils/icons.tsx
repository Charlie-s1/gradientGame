const LoadingWheel = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-2">
      <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-orange-600 dark:border-t-orange-500 rounded-full animate-spin"/>
    </div>
  );
};

export {LoadingWheel}