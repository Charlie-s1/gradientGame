import ReactGA from "react-ga4";

const ID = import.meta.env.VITE_GA_ID;

const initGA = () => {
  if (!ID) return;
  ReactGA.initialize(ID, {
    gtagOptions: { anonymize_ip: true },
  });
};

const logPageView = (path?: string) => {
  ReactGA.send({ hitType: "pageview", page: path ?? window.location.pathname });
};

const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};

export { initGA, logPageView, logEvent };
