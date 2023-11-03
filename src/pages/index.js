import { Domine, Sometype_Mono } from "next/font/google";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createWalletClient, custom, parseEther, createPublicClient, http } from "viem";
import { localhost, mainnet, goerli } from "viem/chains";
import { useAccount } from "wagmi";
import { useIsMounted } from "../hooks/useIsMounted";
import { TypeAnimation } from "react-type-animation";
import Escrow from "../artifacts/contracts/Contract.sol/Escrow.json";
const deploy = require("../scripts/deploy");
const sometype = Sometype_Mono({ subsets: ["latin"], weight: "500" });
const sometype7 = Sometype_Mono({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});
const sometypeLatin = Sometype_Mono({
  subsets: ["latin"],
  weight: "500",
  style: "italic",
});

const network = process.env.NEXT_PUBLIC_ENABLE_TESTNETS == "true" ? goerli : localhost;

export default function Home() {
  const mounted = useIsMounted();
  const { address, isConnected } = useAccount();

  const [arbiter, setArbiter] = useState(null);
  const [beneficiary, setBeneficiary] = useState(null);
  const [value, setValue] = useState(null);
  const [hash, setHash] = useState(null);
  const [escrows, setEscrows] = useState([]);

  async function deployContract() {
    if (!arbiter || !beneficiary || !value) {
      return alert("Please fill all the fields");
    }
    const client = createWalletClient({
      account: address,
      chain: network,
      transport: custom(window.ethereum),
    });
    const ethValue = parseEther(value);
    const tx = await deploy(client, arbiter, beneficiary, ethValue);
    setHash(tx);
    setEscrows([...escrows, {
      address: tx.address,
      arbiter,
      beneficiary,
      value,
    }]);
  }

  async function approve(_address, arbiter) {
    if(address !== arbiter) return alert("You are not the arbiter");
    const client = createWalletClient({
      account: address,
      chain: network,
      transport: custom(window.ethereum),
    });

    const publicClient = createPublicClient({
      chain: network,
      transport: http(),
      account: address,
    })

    const { request } = await publicClient.simulateContract({
      address: _address,
      abi: Escrow.abi,
      functionName: 'approve',
    })

    const hash = await client.writeContract(request)

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 10
    })

    if(hash && receipt) {
      setEscrows(escrows.filter(e => e.address !== _address))
    }
  }

  return (
    <>
      <div className="h-screen">
        <div className={`${sometype.className}`}>
          <div className="absolute top-0 right-0 p-5 z-1">
            <ConnectButton />
          </div>
          <div className={`${sometype7.className}`}>
            <div className="flex justify-center max-xl:mt-10 max-xl:mb-[6%] mb-[4%]">
              <TypeAnimation
                sequence={["_Esc", 1000, "_Escrow", 1000]}
                wrapper="span"
                speed={10}
                deletionSpeed={10}
                style={{ fontSize: "7em" }}
                repeat={Infinity}
              />
            </div>
          </div>
          <div className="flex gap-10 mx-10">
            <form className="flex flex-col gap-2 border-2 border-black rounded-xl shadow-2xl  lg:h-[60vh] xl:h-[65vh] max-xl:h-[50vh] w-[30%] px-3 pt-5 hover:scale-[102%] transition-transform delay-100">
              <h2 className="text-3xl flex justify-center mt-5 bold">
                Contract
              </h2>
              <div className="flex flex-col items-center w-full mt-10 gap-5">
                <div className="flex flex-col gap-2 w-[75%] ">
                  <label for="arbiter" className="text-center">
                    Arbiter
                  </label>
                  <input
                    type="text"
                    id="arbiter"
                    className="border border-black rounded-md h-[32px] p-3 bg-inherit"
                    placeholder="0x000000000000000"
                    onChange={(e) => {
                      e.preventDefault();
                      setArbiter(e.target.value);
                    }}
                  ></input>
                </div>
                <div className="flex flex-col gap-2 w-[75%]">
                  <label for="beneficiary" className="text-center">
                    Beneficiary
                  </label>
                  <input
                    type="text"
                    id="beneficiary"
                    className="border border-black rounded-md h-[32px] p-3 bg-inherit"
                    placeholder="0x000000000000000"
                    onChange={(e) => {
                      e.preventDefault();
                      setBeneficiary(e.target.value);
                    }}
                  ></input>
                </div>
                <div className="flex flex-col gap-2 w-[75%]">
                  <label for="value" className="text-center">
                    Value
                  </label>
                  <input
                    type="text"
                    id="value"
                    className="border border-black rounded-md h-[32px] p-3 bg-inherit"
                    placeholder="1 ETH"
                    onChange={(e) => {
                      e.preventDefault();
                      const regex = /[^0-9.]/;
                      if (regex.test(e.target.value)) {
                        e.preventDefault();
                        e.target.value = ""; // Clear the input field
                        alert("Please enter a valid number");
                      } else setValue(e.target.value);
                    }}
                  ></input>
                </div>
              </div>
              {mounted && isConnected && (
                <div className="flex justify-center">
                  <button
                    className=" bg-black text-white px-5 py-2 rounded-lg mt-10 w-[75%] justify-center transition-transform hover:scale-[102%]"
                    onClick={(e) => {
                      e.preventDefault();
                      deployContract();
                    }}
                  >
                    Deploy
                  </button>
                </div>
              )}
              {/* {hash.hash ? (
                <h2 className="p-4 text-gray-400 text-center break-words">
                  Tx Hash: {hash.hash}
                </h2>
              ) : (
                <h2 className="p-4 text-gray-400 text-center break-words">
                  {hash}
                </h2>
              )} */}
            </form>
            <div className="flex-grow  border-black border-2 justify-center rounded-xl shadow-2xl">
              <h2 className="text-center mt-8 text-3xl justify-center">
                Deployed Contracts
              </h2>
              {escrows?.map((escrow, idx) => {
                return (
                  <div key={idx} className="flex flex-col mt-10 mx-5 border-2 border-black rounded-xl shadow-lg gap-5 hover:scale-[101%] transition-transform">
                    <div className="flex ">
                      <div className="flex flex-col justify-start gap-3 p-3">
                        <h2 className="">
                          Arbiter{" "}
                          <span className="text-gray-500">
                            {escrow?.arbiter}
                          </span>
                        </h2>
                        <h2 className="">
                          Beneficiary{" "}
                          <span className="text-gray-500">
                          {escrow?.beneficiary}
                          </span>
                        </h2>
                        <h2 className="">
                          Value{" "}
                          <span className="text-gray-500">
                            {escrow?.value} ETH
                          </span>
                        </h2>
                      </div>
                      <div className="flex justify-evenly items-center flex-grow ">
                        <button className="bg-black text-white px-5 py-2 rounded-lg  justify-center transition-transform hover:scale-[102%] w-[50%]"
                          onClick={e => {
                            e.preventDefault();
                            approve(escrow?.address, escrow?.arbiter);
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className={`${sometypeLatin.className} flex absolute bottom-0 ml-5 mb-5`}
        >
          <TypeAnimation
            sequence={["by 0x.elpabl0", 2000, "by elpabl0.eth", 2000]}
            wrapper="span"
            speed={5}
            deletionSpeed={5}
            style={{ fontSize: "1.125rem" }}
            repeat={Infinity}
          />
          <h2 className="text-lg">for Alchemy University</h2>
        </div>
      </div>
    </>
  );
}
