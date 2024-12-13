document.addEventListener("DOMContentLoaded", () => {
  const contractAddress = "0x8A4c9Bb74B8AC87d4Bdd0570a612712094a929C6";
  const contractABI = [
    {
      "inputs": [],
      "name": "requestDelayInfo",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "requestId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "NFTIssued",
      "type": "event"
    }
  ];

  let startTime = null; // 計測開始時間をリセット可能にする

  const requestButton = document.getElementById("requestButton");
  const resetButton = document.getElementById("resetButton");

  requestButton.addEventListener("click", async () => {
    try {
      document.getElementById("status").innerText = "Status: Sending request...";
      startTime = Date.now(); // 計測開始タイミング

      if (!window.ethereum) {
        alert("MetaMask is required to run this application!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // 過去のイベントを防ぐためリスナーをリセット
      contract.removeAllListeners("NFTIssued");

      // NFT発行完了のイベントをリッスン
      contract.on("NFTIssued", (recipient, tokenId) => {
        const endTime = Date.now(); // 計測終了タイミング
        const elapsedTimeMs = endTime - startTime;
        const elapsedTimeSec = (elapsedTimeMs / 1000).toFixed(3);

        document.getElementById("status").innerText = `Status: NFT issued to ${recipient}`;
        document.getElementById("processingTime").innerText = `Processing Time: ${elapsedTimeSec} seconds`;
      });

      // MetaMaskでトランザクションを承認し、Chainlinkリクエストを送信
      const tx = await contract.requestDelayInfo();
      await tx.wait();

      document.getElementById("status").innerText = "Status: Request sent. Waiting for response...";
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("status").innerText = "Status: Error occurred. Check console for details.";
    }
  });

  // リセットボタンの動作
  resetButton.addEventListener("click", () => {
    // 状態表示を初期化
    document.getElementById("status").innerText = "Status: Waiting for action...";
    document.getElementById("processingTime").innerText = "Processing Time: N/A";

    // 記録情報をリセット
    startTime = null;

    console.log("Application has been reset.");
  });
});

