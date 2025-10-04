export const OnboardingPageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="p-2 rounded-xl shadow-sm w-full h-full">{children}</div>
  );
};
