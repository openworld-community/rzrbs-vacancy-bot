import { IVacancyParsed } from "../../types/vacancy";
import { EditVacancyService, MessagePreviewService, logger } from "../index";
import { parseVacancyFieldsTextMessage } from "../vacancy-parser";

export const subscribeToTextMessage = async (ctx) => {
  const { message_id, from, text, chat } = ctx?.update?.message || {};

  try {
    if (!message_id || !from?.username || !chat?.id) {
      throw Error("cannot retrieve required message info");
    }

    const [techInfoLine, disclaimerLine, gapLine, ...updatedInfoText] =
      text.split("\n");

    // edited existing vacancy
    if (techInfoLine && techInfoLine.startsWith(`@${ctx?.botInfo?.username}`)) {
      const [, messageId] = techInfoLine.split(" > ");

      await EditVacancyService.onVacancyEdit(ctx, {
        messageId,
        updatedText: updatedInfoText.join("\n"),
      });
      return;
    }

    // here we generate vacancy text from message somehow

    // const textExamples = [
    //   `Frontend Developer

    //   Компания: Intentiq
    //   З/П сколько и как: 5000 $ gross
    //   Ограничение по локации: не РФ и РБ
    //   Иностранный язык: B2-C1 Английский

    //   Навыки и опыт работы:
    //   — native js + UI на react + figma
    //   — от 5 лет

    //   Процесс найма:
    //   HR, Техническое интервью, Оффер

    //   Описание:
    //   Израильская компания, которая занимается идентификацией пользователей и таргетированием рекламы на разных устройствах  - компьютер, мобильный телефон или планшет, Smart TV и т.д. Продукт позволяет выявить связь между пользователями разных устройств.

    //   На основе big data компания назначает каждому пользователю некий уникальный ID, который затем передает рекламным площадкам DSP/SSP (автоматизированные системы покупки/продажи рекламы). Вся информация о пользователях собирается и передается на площадки в обезличенном виде, таким образом защищая персональные данные. Ежедневно компания анализирует более 20 млрд различных сигналов и в реальном времени формирует портреты пользователей.`,
    //   `Кому: node.js Kotlin, Gо, Python и React или желающим писать на них (особенно если хотите перейти с С/С++) Компания: словацкий финтех аутсорс Vacuumlabs (подробнее https://vacuumlabs.com/about)
    //   З/П сколько и как: от 2500 евро в мес. для джунов до 6000 евро в мес. для мидлов/синьеров (это в гросс) + Единовременная выплата в 2000 евро на руки при трудоустройстве.
    //   Ограничение по локации (если есть): работать из любой страны скроме РФ и РБ. Деятельно помогаем с релоацией на Кипр, в другие страны - консультационно.
    //   Иностранный язык (если необходим): английский свободный обязательно. В компании пока нет русскоговорящих сотрудников.
    //   Навыки и опыт работы: от 2-х лет, хорошая алгоритмическая подготовка, в идеале опыт решения задачек и участие в соревнованиях на площадках типа codeforces  Процесс найма: 1) 20-30 минут с англоговорящим HR-ом 2) решение алгоритмической задачи на платформе (2 часа) 3) техсобес включая лайфкодинг (2-2,5 часа) 4) Собес по софтскиллам с командой.
    //   Описание: Vacuumlabs  формирует команду разработки на Кипре + усиляет текущие команды, поэтому есть вакансии на разных языка и в разных командах. Сейчас штат разработчиков +/- 300 человек, раскиданных по всему миру. Принцип компании: «Сильные инженеры без жесткой привязки к технологиям». Трудоустройство официальное, возможна полная и частичная занятость. При полной заняточти - оплата отпуска, больничного, возможность приобретения акций компании, дальнейшая релокация в страны ЕС (когда будет такая возможность).`,
    //   `Привет! 🙂 Хочу предложить вакансию Senior Backend разработчика в компанию inDriver

    //   Senior Backend Engineer
    //   Компания: inDriver
    //   З/П сколько и как: от 256 000 руб. и выше

    //   Ограничение по локации: релокейт в Казахстан после ИС с возможностью последующей релокации на Кипр.

    //   Навыки и опыт работы:
    //   Используем Golang для разработки продуктов, базу данных MySQL, MongoDB, а кэш на Redis. Разработку ведем на Github, используем TeamCity и Github Actions.
    //   В инфраструктуре Docker, Kubernetes, Helm, Prometheus, Grafana и Kafka. Ещё мы используем Feature Toggles, Blue-Green Deployment и другие подходы к разработке, чтобы ничего не сломалось в продакшене.

    //   Процесс найма: 3 этапа - HR, техническое собеседование и финальная встреча.

    //   Описание: полное описание вакансии
    //   Контакт: @liuboushka888 или lubov.iv@indriver.com`,
    // ];

    // for(let i = 0; i < textExamples.length; i++) {
    //   const parsedVacancyObject: IVacancyParsed = parseVacancyFieldsTextMessage(ctx,
    //     textExamples[i]
    //   );

    //  await MessagePreviewService.sendMessagePreview(ctx, parsedVacancyObject);
    // }

    const parsedVacancyObject = parseVacancyFieldsTextMessage(ctx, text);

    await MessagePreviewService.sendMessagePreview(ctx, parsedVacancyObject);
  } catch (err) {
    logger.error(
      `Failed to process incoming message ${from?.username}::${
        chat?.id
      }::${message_id} - ${(err as Error)?.message || JSON.stringify(err)}`
    );
  }
};
