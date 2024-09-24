import { atom } from "recoil";

const connectionsAtom = atom({
  key: "connectionsAtom", // unique ID
  default: {
    followers: [],
    following: [],
  },
});

export default connectionsAtom;
