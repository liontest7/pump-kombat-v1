// Array of available stage backgrounds
const stageBackgrounds = [
  "/images/stages/stage-intimes.jpg",
  "/images/stages/stage-nordkiez2.jpg",
  "/images/stages/stage-raw1.jpg",
  "/images/stages/stage-raw2.jpg",
  "/images/stages/stage-boxi_final.jpg",
  "/images/stages/stage-rigaer1.jpg",
]

export const stages = [
  { id: "intimes", name: "In Times Square", image: "/images/stages/stage-intimes.jpg" },
  { id: "nordkiez2", name: "Nord Kiez", image: "/images/stages/stage-nordkiez2.jpg" },
  { id: "raw1", name: "RAW Arena", image: "/images/stages/stage-raw1.jpg" },
  { id: "raw2", name: "RAW Underground", image: "/images/stages/stage-raw2.jpg" },
  { id: "boxi_final", name: "Boxi Arena", image: "/images/stages/stage-boxi_final.jpg" },
  { id: "rigaer1", name: "Rigaer Street", image: "/images/stages/stage-rigaer1.jpg" },
]

// Function to get a random stage background
export function getRandomStageBackground(): string {
  const randomIndex = Math.floor(Math.random() * stageBackgrounds.length)
  return stageBackgrounds[randomIndex]
}

export function getRandomStageId(): string {
  const randomIndex = Math.floor(Math.random() * stages.length)
  return stages[randomIndex].id
}
