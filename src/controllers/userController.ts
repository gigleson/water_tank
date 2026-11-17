
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../prisma/db.js";

// Display all users (never expose password hashes)
export const getUsers = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const users = await db.orm.public.User
            .select("id", "name", "email", "role", "isActive", "createdAt")
            .all();

        res.render("users", { users });
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).send("Failed to retrieve users.");
    }
};

// Display the add-user page
export const getAddUser = (
    req: Request,
    res: Response
): void => {
    res.render("add-user", { error: null });
};

// Create a Staff account
export const createUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!name || !email || !password) {
            res.status(400).render("add-user", {
                error: "All fields are required."
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).render("add-user", {
                error: "Password must be at least 8 characters."
            });
            return;
        }

        const existingUser = await db.orm.public.User
            .where({ email })
            .first();

        if (existingUser) {
            res.status(400).render("add-user", {
                error: "This email is already registered."
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.orm.public.User.create({
            name,
            email,
            passwordHash,
            role: "STAFF",
            isActive: true
        });

        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Failed to create user.");
    }
};

// Activate or deactivate a Staff account
export const toggleUserStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).send("Invalid user ID.");
            return;
        }

        const user = await db.orm.public.User
            .whereUnique({ id })
            .first();

        if (!user) {
            res.status(404).send("User not found.");
            return;
        }

        if (user.role !== "STAFF") {
            res.status(403).send("Only Staff accounts can be modified here.");
            return;
        }

        await db.orm.public.User
            .where({ id })
            .update({
                isActive: !user.isActive,
                updatedAt: new Date()
            });

        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).send("Failed to update user status.");
    }
};

