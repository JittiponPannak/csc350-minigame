import { createContext, useContext, useState } from 'react';

const stateContext = createContext();

class State {
    State(uid, mode, name, score, level) {
        this.uid = uid;
        this.mode = mode;
        this.name = name;
        this.score = score;
        this.level = level;
    }
}

export function stateProvider({ children }) {
  const [state, setState] = useState(new State(-1, -1, "", -1, -1));
  return (
    <stateContext.Provider value={{ state, setState }}>
      {children}
    </stateContext.Provider>
  );
}

export function useStateContext() {
  return useContext(stateContext);
}