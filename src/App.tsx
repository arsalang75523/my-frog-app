import { useState, useEffect } from 'react';

const AIRSTACK_API_KEY = '13827f8b8c521443da97ed54d4d6a891';

type FarcasterEarningStat = {
  entityId: string;
  entityType: string;
  allEarningsAmount: number; // مقدار موکسی
  castEarningsAmount: number;
  frameDevEarningsAmount: number;
  otherEarningsAmount: number;
};

type SocialStat = {
  userId: string;
  profileName: string;
  totalSpendAllowance: {
    frameInteractions: number;
    likes: number;
    recasts: number;
    replies: number;
  };
  realTimeFarScore: {
    farScore: number;
  };
};

const App = () => {
  const [fid, setFid] = useState('');
  const [earnings, setEarnings] = useState<FarcasterEarningStat[]>([]);
  const [socials, setSocials] = useState<SocialStat[]>([]);
  const [moxiePrice, setMoxiePrice] = useState<number | null>(null); // قیمت لحظه‌ای موکسی
  const [loading, setLoading] = useState(false);
  const [earningDays] = useState<number>(90); // تعداد روزهای موکسی ارنینگ

  const formatNumber = (number: number): string => {
    return number.toLocaleString('en-US');
  };

  // دریافت قیمت لحظه‌ای موکسی
  const fetchMoxiePrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=moxie&vs_currencies=usd'
      );
      const data = await response.json();
      setMoxiePrice(data.moxie?.usd || 0);
    } catch (error) {
      console.error('Error fetching Moxie price:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    const earningsQuery = {
      query: `
        query {
          FarcasterMoxieEarningStats(
            input: {
              timeframe: LIFETIME,
              blockchain: ALL,
              filter: { entityType: {_eq: USER}, entityId: {_eq: "${fid}" } }
            }
          ) {
            FarcasterMoxieEarningStat {
              entityId
              entityType
              allEarningsAmount
              castEarningsAmount
              frameDevEarningsAmount
              otherEarningsAmount
            }
          }
        }
      `,
    };

    const socialsQuery = {
      query: `
        query {
          Socials(
            input: {
              filter: { dappName: {_eq: farcaster}, userId: {_eq: "${fid}" } },
              blockchain: ethereum
            }
          ) {
            Social {
              userId
              profileName
              totalSpendAllowance {
                frameInteractions
                likes
                recasts
                replies
              }
              realTimeFarScore {
                farScore
              }
            }
          }
        }
      `,
    };

    try {
      const [earningsResponse, socialsResponse] = await Promise.all([
        fetch('https://api.airstack.xyz/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AIRSTACK_API_KEY}`,
          },
          body: JSON.stringify(earningsQuery),
        }).then((res) => res.json()),
        fetch('https://api.airstack.xyz/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AIRSTACK_API_KEY}`,
          },
          body: JSON.stringify(socialsQuery),
        }).then((res) => res.json()),
      ]);

      if (earningsResponse.data?.FarcasterMoxieEarningStats?.FarcasterMoxieEarningStat) {
        setEarnings(earningsResponse.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat);
      }

      if (socialsResponse.data?.Socials?.Social) {
        setSocials(socialsResponse.data.Socials.Social);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // محاسبه مقادیر کل Earnings و Score
    const totalEarnings = earnings.reduce((sum, e) => sum + e.allEarningsAmount, 0);
    const totalScoreMoxie = socials.reduce((sum, s) => {
      const farScore = s.realTimeFarScore.farScore;
      const likesMoxie = farScore * 0.5 * s.totalSpendAllowance.likes;
      const repliesMoxie = farScore * 1 * s.totalSpendAllowance.replies;
      const recastsMoxie = farScore * 2 * s.totalSpendAllowance.recasts;
      return sum + (likesMoxie + repliesMoxie + recastsMoxie) * earningDays;
    }, 0);

    // متن پویا برای اشتراک‌گذاری
    const shareText = `I've earned ${formatNumber(totalEarnings)} Moxie so far and distributed ${formatNumber(
      totalScoreMoxie
    )} Moxie in the protocol. Cooked by @arsalang75523`;

    const shareURL = `https://your-app-url.com?fid=${fid}`;
    const farcasterShareURL = `https://farcaster.com/share?url=${encodeURIComponent(
      shareURL
    )}&text=${encodeURIComponent(shareText)}`;

    window.open(farcasterShareURL, '_blank');
  };

  useEffect(() => {
    fetchMoxiePrice(); // دریافت قیمت لحظه‌ای موکسی هنگام بارگذاری
  }, []);

  useEffect(() => {
    if (fid) fetchData();
  }, [fid]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Farcaster Data Viewer</h1>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={fid}
          onChange={(e) => setFid(e.target.value)}
          placeholder="Enter Farcaster ID (FID)"
          style={styles.input}
        />
        <button onClick={fetchData} style={styles.button}>
          Fetch Data
        </button>
        <button onClick={handleShare} style={styles.shareButton}>
          Share
        </button>
      </div>
      {loading ? (
        <div style={styles.spinnerContainer}>Loading...</div>
      ) : (
        <>
          {socials.length > 0 && (
            <h2 style={styles.sectionTitle}>
              Data for <span style={styles.profileName}>{socials[0].profileName}</span>
            </h2>
          )}
          <div style={styles.card}>
            <h2>Earnings Data</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableCell}>Entity ID</th>
                  <th style={styles.tableCell}>Entity Type</th>
                  <th style={styles.tableCell}>All Earnings (Moxie)</th>
                  <th style={styles.tableCell}>Earnings (USD)</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e, idx) => (
                  <tr key={idx}>
                    <td style={styles.tableCell}>{e.entityId}</td>
                    <td style={styles.tableCell}>{e.entityType}</td>
                    <td style={styles.tableCell}>{formatNumber(e.allEarningsAmount)}</td>
                    <td style={styles.tableCell}>
                      {moxiePrice
                        ? `$${formatNumber(e.allEarningsAmount * moxiePrice)}`
                        : 'Fetching price...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={styles.card}>
            <h2>Score Data</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableCell}>User ID</th>
                  <th style={styles.tableCell}>Likes Moxie</th>
                  <th style={styles.tableCell}>Replies Moxie</th>
                  <th style={styles.tableCell}>Recasts Moxie</th>
                  <th style={styles.tableCell}>All-Time Moxie</th>
                  <th style={styles.tableCell}>All-Time USD</th>
                </tr>
              </thead>
              <tbody>
                {socials.map((s, idx) => {
                  const farScore = s.realTimeFarScore.farScore;
                  const likesMoxie = farScore * 0.5 * s.totalSpendAllowance.likes;
                  const repliesMoxie = farScore * 1 * s.totalSpendAllowance.replies;
                  const recastsMoxie = farScore * 2 * s.totalSpendAllowance.recasts;
                  const allTimeMoxie =
                    (likesMoxie + repliesMoxie + recastsMoxie) * earningDays;
                  const allTimeUSD = moxiePrice ? allTimeMoxie * moxiePrice : 0;

                  return (
                    <tr key={idx}>
                      <td style={styles.tableCell}>{s.userId}</td>
                      <td style={styles.tableCell}>{formatNumber(likesMoxie)}</td>
                      <td style={styles.tableCell}>{formatNumber(repliesMoxie)}</td>
                      <td style={styles.tableCell}>{formatNumber(recastsMoxie)}</td>
                      <td style={styles.tableCell}>{formatNumber(allTimeMoxie)}</td>
                      <td style={styles.tableCell}>
                        {moxiePrice ? `$${formatNumber(allTimeUSD)}` : 'Fetching price...'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={styles.footer}>cooked by @arsalang75523</p>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center' as 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  title: { color: '#4CAF50', fontSize: '24px' },
  sectionTitle: { margin: '20px 0', fontSize: '20px', color: '#333' },
  profileName: { fontWeight: 'bold', color: '#007BFF' },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  },
  shareButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    margin: '20px auto',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '80%',
  },
  table: { width: '100%', borderCollapse: 'collapse' as 'collapse' },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left' as 'left',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
  },
  footer: {
    color: '#888',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
};

export default App;

