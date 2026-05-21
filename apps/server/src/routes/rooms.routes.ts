import { Router } from "express"
import * as roomsController from "../controllers/rooms.controller"

const router = Router()

router.post("/", roomsController.createRoom)

router.get("/:roomId", roomsController.getRoom)

export default router
