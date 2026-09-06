async function main() {
  const code = await ethers.provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3")
  console.log("Contract code length:", code.length)
  if (code.length > 2) {
    console.log("Contract is deployed!")
  } else {
    console.log("Contract NOT deployed!")
  }
}

main().catch(console.error)