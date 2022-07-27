import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import Web3B from "web3";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;


function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);

  const [warningFeedback, setWarningFeedback] = useState(``);
  const [successFeedback, setSuccessFeedback] = useState(``);

  const [collectionRedy, setCollectionRedy] = useState(false);
  const [totalTokensCount , setTotalTokensCount] = useState(0);  
  const [nftCollection, setNftCollection] = useState("");

  const [counter, setCounter] = useState(0);
  
  let fetchingBalance = false;
  let currentTokenID = -1;
  let tokenCollection = [];

  
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
  });

  
  const removefeedback = () => {
    setTimeout(function(){ 
      setSuccessFeedback(``);
      setWarningFeedback(``);
    }, 5000);
  }

  const getTokensCount = () => {
    if(fetchingBalance) { return; }
    fetchingBalance = true;

    console.log ("getTokensCount()");

    blockchain.smartContract.methods.balanceOf(blockchain.account).call().then((receipt) => {
      setTotalTokensCount (receipt);
      console.log(receipt);

      fetchingBalance = false;
    });
  }

  const getTokenCollection = (currentIndex) => {
    if(currentIndex == undefined) {
      console.log("getTokenCollection()");
      console.log("Undefined");
      return;
    }

    if(totalTokensCount == 0){
      console.log("totalTokensCount == 0");
      return;
    }

    let cIndex = parseInt(currentIndex);
    let balance = parseInt(totalTokensCount);

    console.log("getTokenCollection()");
    console.log(currentIndex);
    console.log(currentTokenID);

    if(currentTokenID == cIndex) { 
      console.log("currentTokenID == currentIndex");
      return; 
    }
       currentTokenID = cIndex;

    if(cIndex >= balance) {
      console.log("currentIndex > totalTokensCount");
      console.log(cIndex);
      console.log(balance);

      // currentIndex = -1;
      setCounter (1);

      console.log(tokenCollection.length);

      setCollectionRedy (true);
      setNftCollection(tokenCollection);

      return;
    }

    console.log("blockchain call");

    blockchain.smartContract.methods.tokenOfOwnerByIndex(blockchain.account, cIndex).call().then((receipt) => {
       console.log(receipt);
       tokenCollection[cIndex] = receipt;
       console.log(tokenCollection);

       getTokenCollection(cIndex + 1);
    });    
  }

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));

      // Get the balance for this wallet
      getTokensCount();
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

 
  // Check if wallet is connected
  if(blockchain.account === "" || blockchain.smartContract === null) {
    return (
      <>
        <div id="dapp" class="connect">
            <h2>
              Boo Things
            </h2>

            <button
              onClick={(e) => {
                e.preventDefault();
                dispatch(connect());
                getData();
              }}
            >
              Connect your wallet
            </button>
        </div>

        {blockchain.errorMsg !== "" ?(<><div class="warning-message">{blockchain.errorMsg}</div></>):null}
        {warningFeedback !== "" ?(<><div class="warning-message">{warningFeedback}</div></>):null}
        {successFeedback !== "" ?(<><div class="success-message">{successFeedback}</div></>):null}
      </>
    );
  }

if(collectionRedy && nftCollection){

  const openseaurl = "https://opensea.io/assets/matic/0xed9b49afac032401f15527c42c6c54931aa6571a/";
  const listItems = nftCollection.map((d) => 
    <li class={"booRank"}>
      <a href={openseaurl+d} target={"_blank"}>
        <img width={"120"} src={ "https://ditothepug.com/wp-content/boo-things/" + d + ".png"} />
        <h4>Rank {d}</h4>
        <div class={"boo-number"}>{d}</div>
        </a>
        </li>);

  return (
      <div>
      { listItems }
      </div>
  );

}


return (
    <>
      <h2>Fetching your Boo Things Collection</h2>

      <p>Total Boos: {parseInt(totalTokensCount)}</p>

      <div class="spinner-container">
        <div class="spinner"></div>
      </div>

      { totalTokensCount > 0 ? getTokenCollection(0) : null }    
    </>
  
  );
  
}

export default App;
