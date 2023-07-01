import { TimePeriod } from "../../constants/common";
import config from "../../utils/config";
import { setDailyPublishInterval } from "../../utils/dailyPublishInterval";
import { getTimePeriodInMilliseconds } from "../../utils/getTimePeriodInMilliseconds";
import { getTodayWeekDay } from "../../utils/getTodayWeekDay";
import logger from "../logger";
import { publishNextVacancyFromQueue } from "./publishNextVacancyFromQueue";
import { countPublishIntervalForVacanciesPool } from "./utils/countPublishIntervalForVacanciesPool";

export const monitorPublishQueueByTimer = async (
  params: { initialExecution?: boolean } | undefined
) => {
  const currentHour = new Date().getHours();
  const currentWeekDay = getTodayWeekDay();
  const [from, to] = config.publishConfig.schedule[currentWeekDay] || [];

  if (currentHour === 0) {
    logger.info(`Publish Queue: new day started`);

    if (!from && !to) {
      logger.info(
        "Publish Queue: Today is a day off, analyzis finished for today"
      );
      return;
    }
  }

  if (params?.initialExecution || currentHour === from) {
    logger.info(`Publish Queue: analysis by timer...`);
    const publishInterval = await countPublishIntervalForVacanciesPool();

    logger.info(
      `Vacancies will be published with ${publishInterval} hours interval`
    );

    // initial execution
    publishNextVacancyFromQueue();

    setDailyPublishInterval(
      setInterval(
        publishNextVacancyFromQueue,
        getTimePeriodInMilliseconds(publishInterval, TimePeriod.Hours)
      )
    );
  }
};
