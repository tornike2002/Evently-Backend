import { Request, Response } from "express";
import { Events } from "../models/Events";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const data = await Events.create(req.body);
    res.status(201).json({ message: "Event created successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const data = await Events.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Events fetched successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const data = await Events.findById(req.params.id);
    if (!data) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.status(200).json({ message: "Event fetched successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateEventById = async (req: Request, res: Response) => {
  try {
    const data = await Events.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.status(200).json({ message: "Event updated successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteEventById = async (req: Request, res: Response) => {
  try {
    const data = await Events.findByIdAndDelete(req.params.id);
    if (!data) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.status(200).json({ message: "Event deleted successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
