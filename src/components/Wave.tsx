const ORANGE = '#FFB34F';
const GREEN = '#00993F';

// @todo to think: think whether to use green or orange
export function Wave({ waveIndex }: { waveIndex: 0 | 1 }) {
  const A =
    'M0,128L80,160C160,192,320,256,480,240C640,224,800,128,960,117.3C1120,107,1280,181,1360,218.7L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z';
  const B =
    'M0,32L80,37.3C160,43,320,53,480,85.3C640,117,800,171,960,176C1120,181,1280,139,1360,117.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z';

  // change the `key` to restart the animate element on toggle
  const from = waveIndex === 0 ? B : A;
  const to = waveIndex === 0 ? A : B;

  return (
    <div className="fixed bottom-0 left-0 z-30 w-full" id="wave-onboarding">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="block"
      >
        <path
          fill={GREEN}
          fillOpacity="1"
          d={from}
          key={to /* restart trick */}
        >
          <animate
            attributeName="d"
            dur="1s"
            begin="0s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
            keyTimes="0;1"
            values={`${from};${to}`}
          />
        </path>
      </svg>
    </div>
  );
}
