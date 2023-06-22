import { PublishVacancyService, logger } from "../index";
import PublishQueueItemModel from "../../schemas/publish_queue";
import config from "../../utils/config";

export const subscribeToPublishQueueMonitoring = () => {
  if (!config.publishInterval) {
    logger.warn("WARN: Publish queue won't work until PUBLISH_INTERVAL is set");
    return;
  }

  logger.info(
    `Subscribed to check publish queue each ${config.publishInterval} hours`
  );
  return setInterval(async () => {
    try {
      const publishQueueItems = await PublishQueueItemModel.findAll({
        where: {
          published: false,
          removed: false,
        },
      });

      if (!publishQueueItems.length) {
        logger.info(`Publish queue is empty`);
      } else {
        logger.info(
          `Publish queue - ${publishQueueItems.length} vacancies are waiting to be published`
        );

        for (const publishQueueItem of publishQueueItems) {
          await PublishVacancyService.publishVacancyToChannels(
            publishQueueItem
          );
        }
      }
    } catch (err) {
      logger.error(
        `Failed to fetch publish queue items - ${
          (err as Error).message || JSON.stringify(err)
        }`
      );
    }
    // PUBLISH_INTERVAL hours
  }, 1000 * 60 * 60 * config.publishInterval);
};
