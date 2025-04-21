import { NextResponse } from "next/server";
import { mysqlPool } from "../db";

export async function GET(request, { params }) {
  const promisePool = mysqlPool.promise();
  const [rows, fields] = await promisePool.query(
    "SELECT * FROM MINIGAME.Users ORDER BY SCORE DESC LIMIT 10;"
  );
  return NextResponse.json(rows);
}
