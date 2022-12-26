import { Badge, Divider, HoverCard } from "@mantine/core"
import { GameSetting } from "hoshimi-venus/out/db/repository/setting_repository";
import classNames from "classnames"
import { Effect, Live } from "hoshimi-venus/out/types/concert_types"
import { SkillEfficacyType } from "hoshimi-venus/out/types/proto/proto_enum"
import { t } from "i18next"
import { memo } from "react"
import { EffColor } from "../../src/static/efficacy_static"
import { getPrivilegedEfficacyList } from "../../src/utils/datamgr"

type EffIdxDictType = { [uuid: string]: number }

const findMinAvaliableIdx = (
  effIdxDict: { [uuid: string]: number }, effs: Effect[]
): number => {
  const unavaliables = effs.map(eff => effIdxDict[eff.id])
  console.log("===start===")
  console.log(unavaliables)
  for (let i = 1; i <= 12; i++) {
    console.log(`i: ${i}`)
    if (!unavaliables.includes(i)) {
      console.log("not included!")
      console.log(`returned: ${i}`)
      console.log("===end===")
      return i
    }
  }
  console.log(`after added: ${unavaliables}`)
  console.log(`returned: ${unavaliables.length}`)
  return 0
}

const flowPosition: {
  [k: number]: string
} = {
  1: "col-start-1 order-1",
  2: "col-start-2 order-2",
  3: "col-start-3 order-3",
  4: "col-start-4 order-4",
  5: "col-start-5 order-5",
  6: "col-start-6 order-6",
  7: "col-start-7 order-7",
  8: "col-start-8 order-8",
  9: "col-start-9 order-9",
  10: "col-start-10 order-10",
  11: "col-start-11 order-11",
  12: "col-start-12 order-12",
}

const weaknessList = [
  ...GameSetting.skillEfficacyTypeWeaknessDownList,
  ...GameSetting.skillEfficacyTypeWeaknessOtherList,
]

type EffFlowProps = {
  ingameIndex: number,
  category: "privileged" | "general",
  live?: Live,
}

const EffRow = ({ prevEffs, curEffs, sequence, category, effIdxDict, ingameIndex, isLastNote }: {
  prevEffs: Effect[],
  curEffs: Effect[],
  sequence: number,
  category: "privileged" | "general",
  effIdxDict: EffIdxDictType,
  ingameIndex: number,
  isLastNote: boolean,
}) => {

  return (
    <div className={`grid grid-cols-12 h-[98%] w-full justify-items-center items-stretch ${category == "privileged" ? "[direction:rtl]" : ""}`}>
      {curEffs.filter(eff =>
        category == "privileged" && getPrivilegedEfficacyList().includes(eff.efficacyType)
        || category == "general" && !getPrivilegedEfficacyList().includes(eff.efficacyType)
      ).map((eff, idx, specifiedEffs) => {
        const isStart = !prevEffs.some(preEff => preEff.id === eff.id)
        const isEnd = eff.remain === 0 || isLastNote
        if (isStart) {
          console.log(`ingame index: ${ingameIndex}`)
          console.log(`sequence: ${sequence}`)
          if (effIdxDict[eff.id] === undefined) {
            effIdxDict[eff.id] = findMinAvaliableIdx(effIdxDict, specifiedEffs)
          }
        }
        return (
          <HoverCard width="auto" shadow="md" key={idx}
            position={category == "privileged" ? "left" : "right"}
            offset={15} withArrow openDelay={80} closeDelay={0} transitionDuration={0}
          >
            <HoverCard.Target>
              <div className={classNames("h-full w-1 grow shrink cursor-pointer",
                flowPosition[effIdxDict[eff.id]],
                isStart ? "rounded-t-full" : "",
                isEnd ? "rounded-b-full" : "",
                (() => {
                  if (weaknessList.includes(eff.efficacyType)) {
                    if (sequence % 3 === 1) {
                      return `${EffColor[eff.efficacyType]}/80` ?? "bg-slate-500"
                    }
                  }
                  return EffColor[eff.efficacyType] ?? "bg-slate-500"
                })(),
              )}>
              </div>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <div className="grid grid-cols-[2fr_1fr] gap-x-2 [direction:ltr]">
                <div className="col-span-2 text-sm">{sequence + 1}</div>
                <div className="col-span-2 text-sm font-medium">{t(SkillEfficacyType[eff.efficacyType])}</div>
                <Divider className="col-span-2 my-1" />
                <div>{t("Grade")}</div><div>{eff.grade}</div>
                {eff.value !== 0 ? <><div>{t("Value")}</div><div>{eff.value}</div></> : null}
                <div>{t("Remain")}</div><div>{eff.remain}</div>
                <div>{t("Source")}</div><div>{eff.sourceIndex} - {eff.sourceSkillIndex}</div>
                <div className="col-span-2">
                  {isStart
                    ? eff.include
                      ? <Badge mr={4} variant="filled" color="green" className="normal-case">{t("Included")}</Badge>
                      : <Badge mr={4} variant="filled" color="pink" className="normal-case">{t("Unincluded")}</Badge>
                    : null}
                  {eff.isInstant ? <Badge variant="filled" className="normal-case">{t("Instant")}</Badge> : ""}
                </div>
              </div>
            </HoverCard.Dropdown>
          </HoverCard>
        )
      })}
    </div >
  )
}

const EffFlow = ({
  ingameIndex,
  category,
  live
}: EffFlowProps) => {
  const effIdxDict: EffIdxDictType = {}

  if (live === undefined) {
    return (<div className="w-full h-full"></div>)
  }
  return (
    <div className={`flex flex-col h-[98%] w-full justify-start ${category == "privileged" ? "items-end" : "items-start"}`}>
      {live.charts.map((chart, idx, arr) => {
        const status = chart.cardStatuses.find(it => it.cardIndex === ingameIndex)!
        const prevEffs = idx === 0 ? [] : arr[idx - 1].cardStatuses.find(it => it.cardIndex === ingameIndex)!.effects
        const curEffs = status.effects
        return (
          <EffRow key={idx}
            prevEffs={prevEffs}
            curEffs={curEffs}
            sequence={idx}
            category={category}
            effIdxDict={effIdxDict}
            ingameIndex={ingameIndex}
            isLastNote={idx === live.quest.musicChartPatterns.length - 1}
          />
        )
      })}
    </div>
  )
}

export default memo(EffFlow)