import { NextResponse } from "next/server";
import { mysqlPool } from "../db";

export async function GET(request, { params }) {
  const id = (await params).id
  const promisePool = mysqlPool.promise()
  
  const [rows, fields] = await promisePool.query(
    'SELECT * FROM `MINIGAME`.`Users` WHERE id = ?',
    [id]
  )

  return NextResponse.json(rows[0])
}