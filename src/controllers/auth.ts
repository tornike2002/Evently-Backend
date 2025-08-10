import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "This email is already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });
    const accessToken = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();
    res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      res.status(400).json({ message: "Email or password is incorrect" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Email or password is incorrect" });
      return;
    }

    const accessToken = generateToken(existingUser._id.toString());
    const refreshToken = generateRefreshToken(existingUser._id.toString());
    existingUser.refreshToken = refreshToken;
    await existingUser.save();
    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
  let payload: any;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
  const user = await User.findById(payload.id);

  if (!user || user.refreshToken !== refreshToken) {
    res.status(403).json({
      message: "Refresh token is invalid",
    });
    return;
  }

  const newAccessToken = generateToken(user._id.toString());
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
  });
  res.status(200).json({
    message: "Token refreshed",
  });
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    res.status(200).json({
      message: "Admin fetched successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
