import { ref } from "firebase/database";
import { db } from "./config";

export function lobbyRef(code) {
  return ref(db, `lobbies/${code}`);
}

export function lobbyPathRef(code, path) {
  return ref(db, `lobbies/${code}/${path}`);
}

export function gameRef(code) {
  return ref(db, `games/${code}`);
}