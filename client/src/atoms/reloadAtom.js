import { atom } from "recoil";

export const reloadAtom = atom({
  key: "reloadAtom", // unique ID
  default: false, // or you can use a number like 0
});
