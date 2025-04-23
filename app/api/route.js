import { NextResponse } from "next/server";
import { mysqlPool } from "./db";

const db = mysqlPool.promise()

export async function GET(request){
    try {
        const [rows, fields] = await db.query(
            'SELECT * FROM MINIGAME.Users'
        )
        return NextResponse.json(rows, {status: 200})
    } catch (error){
        return NextResponse.json({error:"Failed to fetch"}, {status: 500})
    }
}

export async function POST(request){
    try {
        const {NAME, SCORE, DATE, GAMEOVER} = await request.json();

        console.log(NAME, SCORE, DATE, GAMEOVER)

        const [result] = await db.query(
            'INSERT INTO MINIGAME.Users (NAME, SCORE, DATE, GAMEOVER) VALUES (?,?,?,?)', [NAME, SCORE, DATE, GAMEOVER]
        );

        return NextResponse.json({ID: result.insertId, NAME, SCORE, DATE, GAMEOVER}, {status: 200});
    } catch (error){
        return NextResponse.json({error: error}, {status: 500})
    }
}

export async function PUT(request){
    try {
        const {ID, NAME, SCORE, DATE, GAMEOVER} = await request.json();

        console.log(ID, NAME, SCORE, DATE, GAMEOVER)

        const [result] = await db.query(
            'UPDATE MINIGAME.Users SET ID=?, NAME=?, SCORE=?, DATE=?, GAMEOVER=? WHERE ID = ?', [ID, NAME, SCORE, DATE, GAMEOVER, ID]
        );

        if (result.affectedRows == 0){
            return NextResponse.json({error: "ID Not found"}, {status: 404});
        }

        return NextResponse.json({message: "Updated", ID}, {status: 200});
    } catch (error){
        return NextResponse.json({error: error}, {status: 500})
    }
}

export async function DELETE(request){
    try {
        const {ID} = await request.json();
        const [result] = await db.query(
            'DELETE FROM MINIGAME.Users WHERE ID = ?',[ID]
        );

        /*
        if (result.affectedRows == 0){
            return NextResponse.json({error: "ID Not found"}, {status: 404});
        }
        */

        return NextResponse.json({message: "Deleted", ID}, {status: 200});
    } catch (error){
        return NextResponse.json({error: error}, {status: 500})
    }
}