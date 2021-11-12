import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import myImage from "../src/img/turtle.png";
import logoImage from "../src/img/logo.png";
import priceImage from "../src/img/price.png";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)`
  align-self: center !important;
  display: flex !important;
  justify-content: center !important;
  background-color: aqua !important;
  color: #080d26 !important;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3) !important;
  border-radius: 40px !important;
  width: 300px !important;
  height: 70px !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  font-size: 1.5rem !important;
  transition: 0.2s ease-in-out 0s !important;
`;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`; // add your styles here//

const MintButton = styled(Button)`
  align-self: center !important;
  display: flex !important;
  justify-content: center !important;
  background-color: aqua !important;
  color: #080d26 !important;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3) !important;
  border-radius: 40px !important;
  width: 300px !important;
  height: 70px !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  font-size: 1.5rem !important;
  transition: 0.2s ease-in-out 0s !important;
`; // add your styles here

const MainContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  height: 100vh;
  background-color: #080d26;
`;

const BackgroungContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-self: center;
  margin: auto;
  height: 100%;
  width: 60%;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  height: 100vh;
`;

const TitleContent = styled.div`
  justify-content: center;
  display: flex;
  align-items: center;
`;

const TitleImage = styled.img`
  width: 500px;
`;

const ContainerTexte = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
`;

const WavesContainer = styled.div`
  width: 50%;
  background-color: #15202b;
  display: flex;
  align-self: center;
  height: 100%;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: -2rem;
`;
const WavesContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: none;
  justify-content: center;
  margin: auto;
`;

const WavesText = styled.p`
  margin: 0;

  display: flex;
`;

const SoldOut = styled.span`
  font-weight: bold;
  margin-left: 0.5rem;
`;

const ContainerLeftText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ContainerRightImg = styled.div`
  width: 260px;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ImageRight = styled.img`
  width: 100%;
  height: 100%;
`;
const TextLeft = styled.p`
  font-style: italic;
  font-weight: 500;
  font-size: 2.2rem;
`;
const Colored = styled.span`
  font-weight: 700;
  color: aqua;
  font-size: 2.5rem;
`;

const TextRight = styled.p`
  font-style: italic;
  font-weight: 500;
  font-size: 1.5rem;
  color: aqua;
`;
const ImgWrapper = styled.div`
  width: 300px;
  display: flex;
  align-self: center;
  margin-bottom: 0.5rem;
`;

const TurtleImage = styled.img`
  width: 100%;
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: center; ;
`;
const ContentContainerWallet = styled.div`
  margin-top: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 300px;
  justify-content: space-around;
`;

const WalletText = styled.div`
  margin: none;
`;

const TitleTexteWallet = styled.span`
  font-weight: bold;
  display: flex;
  justify-content: center;
`;

const ShareText = styled.p`
  margin: 0;
  font-weight: bold;
  margin-top: 2rem;
  font-style: italic;
`;

// const FaqContainer = styled.div`
//   width: 100%;
//   height: auto;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// `;
// const Faqcontent = styled.div`
//   width: 100%;
// `;
// const FaqWrapper = styled.div`
//   border-radius: 0.5rem;
//   display: flex;
//   width: 60%;
//   height: auto;
// `;

// const FaqTextWrapper = styled.div``;

// const FaqText = styled.div`
//   padding: 1.5rem;
//   background-color: #1f2937;
// `;

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        // itemsAvailable,
        itemsRemaining,
        // itemsRedeemed,
      } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      setItemsRedeemed(itemsRedeemed);

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  return (
    <MainContainer>
      <BackgroungContainer>
        <ContentWrapper>
          <Content>
            <TitleContent>
              <TitleImage src={logoImage} />
            </TitleContent>
            <ContainerTexte>
              <ContainerLeftText>
                <TextLeft>
                  <Colored>4444</Colored> Turtles
                  <br /> Are waiting for you
                </TextLeft>
              </ContainerLeftText>
              <ContainerRightImg>
                <TextRight>
                  <ImageRight src={priceImage} />
                </TextRight>
              </ContainerRightImg>
            </ContainerTexte>

            <MintContainer>
              <WavesContainer>
                <WavesContent>
                  <WavesText>
                    🌊 Wave 1 : 144/4444 &ensp;- 🗓️ 07/11/2021 - 🕖 7 PM UTC ✅{" "}
                    <SoldOut>SOLD OUT</SoldOut>
                  </WavesText>
                  <WavesText>
                    {" "}
                    🌊 Wave 2 : 1200/4444 - 🗓️ 09/11/2021 - 🕓 6 PM UTC
                  </WavesText>
                  {/* <WavesText>
                    {" "}
                    🌊 Wave 3 : 3100/4444 - 🗓️ TBA - 🕐 TBA{" "}//t
                  </WavesText> */}
                </WavesContent>
              </WavesContainer>
              <ImgWrapper>
                <TurtleImage src={myImage} />
              </ImgWrapper>
              {!wallet ? (
                <ConnectButton>Connect Wallet</ConnectButton>
              ) : (
                <MintButton
                  disabled={isSoldOut || isMinting || !isActive}
                  onClick={onMint}
                  variant="contained"
                >
                  {isSoldOut ? (
                    "SOLD OUT"
                  ) : isActive ? (
                    isMinting ? (
                      <CircularProgress />
                    ) : (
                      "MINT"
                    )
                  ) : (
                    <Countdown
                      date={startDate}
                      onMount={({ completed }) =>
                        completed && setIsActive(true)
                      }
                      onComplete={() => setIsActive(true)}
                      renderer={renderCounter}
                    />
                  )}
                </MintButton>
              )}
              <InfoContainer className="infos-wrapper">
                <ContentContainerWallet>
                  {wallet && (
                    <WalletText>
                      <TitleTexteWallet>
                        Balance <br />
                      </TitleTexteWallet>{" "}
                      {(balance || 0).toLocaleString()} SOL
                    </WalletText>
                  )}

                  {wallet && (
                    <WalletText>
                      {" "}
                      <TitleTexteWallet>
                        Wallet <br />
                      </TitleTexteWallet>
                      {shortenAddress(wallet.publicKey.toBase58() || "")}
                    </WalletText>
                  )}
                </ContentContainerWallet>

                {wallet && (
                  <WalletText className="items">
                    <span>
                      <span className="item-title">Total supply:</span>{" "}
                      {itemsAvailable}
                    </span>
                    <span>
                      <span className="item-title">Remaining:</span>{" "}
                      {itemsRemaining}
                    </span>
                    <span>
                      <span className="item-title">Redeemed:</span>{" "}
                      {itemsRedeemed}
                    </span>
                  </WalletText>
                )}
              </InfoContainer>
            </MintContainer>
            <ShareText>Share your SolTurtle On twitter ! 🔥</ShareText>
            {/* <FaqContainer>
              <FaqWrapper>
                <h4>Frequently Asked Questions</h4>
                <Faqcontent>
                  <FaqTextWrapper>
                    <FaqText>
                      <p>
                        1. What is this page? <br />
                        From here you can mint your Home! But first you must
                        have a wallet. We recommend https://phantom.app/
                      </p>
                    </FaqText>
                    <FaqText>
                      <p>
                        2. Does this work on mobile? <br />
                        Some wallets don’t support mobile so we recommend using
                        desktop for a better experience
                      </p>
                    </FaqText>
                  </FaqTextWrapper>
                </Faqcontent>
              </FaqWrapper>
            </FaqContainer> */}
            <Snackbar
              open={alertState.open}
              autoHideDuration={6000}
              onClose={() => setAlertState({ ...alertState, open: false })}
            >
              <Alert
                onClose={() => setAlertState({ ...alertState, open: false })}
                severity={alertState.severity}
              >
                {alertState.message}
              </Alert>
            </Snackbar>
          </Content>
        </ContentWrapper>
      </BackgroungContainer>
    </MainContainer>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
