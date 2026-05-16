import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import messagesRouter from "./messages";
import reportsRouter from "./reports";
import counselorsRouter from "./counselors";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/rooms", roomsRouter);
router.use("/rooms/:roomId/messages", messagesRouter);
router.use("/messages", reportsRouter);
router.use("/counselors", counselorsRouter);
router.use("/stats", statsRouter);

export default router;
