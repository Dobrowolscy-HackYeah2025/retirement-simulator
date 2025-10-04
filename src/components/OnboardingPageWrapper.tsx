const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-full h-2 bg-gray-200">
      <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
    </div>
  );
};

export const OnboardingPageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full w-full flex flex-col grow">
      <div className="m-2 rounded shadow-md outline h-full overflow-hidden">
        <ProgressBar progress={50} />
        <div className=" flex justify-center pt-12 p-2">
          <div className="max-w-80">{children}</div>
        </div>
      </div>
    </div>
  );
};
