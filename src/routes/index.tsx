import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="p-2">
      <Link to="/onboarding">
        <button className="m-4 p-4 bg-primary absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
          Idź do onboardingu
        </button>
      </Link>
    </div>
  );
}
