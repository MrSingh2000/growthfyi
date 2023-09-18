import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { calculateBestPracticesPercentage, calculatePerformace, calculateSeo, convertToTitleCase, roundStringToDecimalPlaces } from '@/helpers';
import Loader from '@/components/Loader';

const inter = Inter({ subsets: ['latin'] });

type Props = {}

type Data = {
  response: Record<string, any>,
  onPageResultArray: { key: string, value: number }[],
  checksArray: { key: string, value: boolean }[],
}

export default function Home({ }: Props) {
  const [data, setData] = useState < Data > ({ response: {}, onPageResultArray: [], checksArray: [] });
  const [seoUrl, setSeoUrl] = useState < string > ("");
  const [loading, setLoading] = useState < boolean > (false);

  
  // Function to handle changes in the input field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeoUrl(e.target.value);
  }

  // Function to preprocess data from the API response
  const preprocessData = (response: Record<string, any>) => {
    // Extract relevant data from the response
    const d = response.tasks[0].result[0].items[0].meta;
    const onPageResultObj = d.content;

    // Filter out null values and create an array
    const filteredKeys1 = Object.keys(onPageResultObj).filter(key => onPageResultObj[key] !== null);
    let onPageResultArray = filteredKeys1.map(key => ({ key, value: onPageResultObj[key] }));

    // Extract other attributes and create an array
    const otherAttributesObj: Record<string, any> = {
      "internal_links_count": d.internal_links_count,
      "external_links_count": d.external_links_count,
      "inbound_links_count": d.inbound_links_count,
      "images_count": d.images_count,
      "images_size": d.images_size,
      "scripts_count": d.scripts_count,
      "scripts_size": d.scripts_size,
      "stylesheets_count": d.stylesheets_count,
      "stylesheets_size": d.stylesheets_size,
    };
    const filteredKeys2 = Object.keys(otherAttributesObj).filter(key => otherAttributesObj[key] !== null);
    const otherAttributesArr = filteredKeys2.map(key => ({ key, value: otherAttributesObj[key] }));

    // Combine the two arrays
    onPageResultArray = onPageResultArray.concat(otherAttributesArr);

    // Process checks data
    const checksObj = response.tasks[0].result[0].items[0].checks;
    // ... (remove specific checks here)

    const checksArray = Object.keys(checksObj).map(key => ({ key, value: checksObj[key] }));

    // Update the state with the data
    setData({ response, onPageResultArray, checksArray });
    setLoading(false);
  }

  // Function to fetch data from the API
  const handleFetchData = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setData({ response: {}, onPageResultArray: [], checksArray: [] });
    if (!seoUrl)
      return;
    setLoading(true);
    try {
      const h = [{ "url": seoUrl, "load_resources": true, "enable_javascript": true, "enable_browser_rendering": true }];
      const data = await fetch('https://api.dataforseo.com/v3/on_page/instant_pages', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic d3d3LmFuc2h1MjAwMEBnbWFpbC5jb206ZjEwN2NjNTVjY2Y3NjhmYQ==',
        },
        body: JSON.stringify(h),
      });

      const r = await data.json();
      preprocessData(r);
    } catch (error) {
      alert("Error: Some Error Occurred \n Note: Ensure 'https://' in the input url");
      setLoading(false);
    }
  }

  // Function to display a score block
  const displayScoreBlock = (title: string, val: string): JSX.Element => {
    return (<>
      <div className='mt-4 ml-0 md:ml-2'>
        <div className="block p-4 m-auto bg-white rounded-lg shadow w-72">
          <div>
            <span className="text-xs font-light inline-block py-1 px-2 uppercase rounded-full text-white bg-pink-300">
              {title}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-400 rounded-full mt-3">
            <div style={{ width: `${val}%` }} className={`h-full text-center text-xs text-white bg-pink-300 rounded-full`}>
              {val}%
            </div>
          </div>
        </div>
      </div>
    </>);
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center px-24 py-12 ${inter.className}`}
    >
      <p className='font-semibold text-2xl mb-10'>Get SEO of your website</p>
      <div className='mb-5'>
        <div className=" relative ">
          <label htmlFor="name-with-label" className="text-gray-700">
            URL
          </label>
          <input onChange={(e) => handleChange(e)} type="text" id="name-with-label" className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" name="email" placeholder="https://dataforseo.com/blog" />
        </div>
        <button onClick={(e) => handleFetchData(e)} className="px-4 py-2 w-full mt-2 text-base font-medium text-center text-white transition duration-500 ease-in-out transform bg-blue-600 lg:px-10 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Get SEO</button>
      </div>

      {/* Scores */}
      {loading ? <Loader /> : data.response.tasks
       ? (<div>
        <div className="w-full">
          <div className='block md:flex justify-around'>
            {displayScoreBlock("On page score", data?.response?.tasks[0]?.result[0].items[0].onpage_score.toString())}
            {displayScoreBlock("SEO", calculateSeo(data.response.tasks[0].result[0].items[0].checks))}
          </div>
          <div className='block md:flex justify-around'>
            {displayScoreBlock("Performance", calculatePerformace(data.response.tasks[0].result[0].items[0].page_timing))}
            {displayScoreBlock("Best Practices", calculateBestPracticesPercentage(data.response.tasks[0].result[0].items[0].checks))}
          </div>
        </div>


        <h2 className='font-semibold text-xl mt-4'>Onpage Results</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {
            data.onPageResultArray.map((item, index) => {
              return (
                <>
                  <div key={index} className='transition ease-in-out delay-0 hover:-translate-y-1 hover:scale-110 cursor-pointer hover:bg-black hover:text-white duration-100 bg-white border-2 rounded-lg py-2 px-4 w-[120px] h-[95px] md:w-[180px] md:h-[125px] flex flex-col justify-center items-center'>
                    <p className=''>{roundStringToDecimalPlaces(item.value.toString(), 2)}</p>
                    <p className='h-auto text-center text-xs'>{convertToTitleCase(item.key)}</p>
                  </div>
                </>
              );
            })
          }
        </div>

        <h2 className='font-semibold text-xl mt-4'>Checks</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {
            data.checksArray.map((item, index) => {
              return (
                <>
                  <div key={index} className='transition ease-in-out delay-0 hover:-translate-y-1 hover:scale-110 cursor-pointer hover:bg-black hover:text-white duration-100 bg-white border-2 rounded-lg py-2 px-4 w-[120px] h-[95px] md:w-[180px] md:h-[125px] flex flex-col justify-center items-center'>
                    <p className='mb-3'>{item.value ? <><span className='bg-[#00ff00] font-semibold font-serif text-white p-2 rounded-2xl'>True</span></> : <><span className='bg-[#ff0000] font-semibold font-serif text-white p-2 rounded-2xl'>False</span></>}</p>
                    <p className='h-auto text-center text-xs'>{convertToTitleCase(item.key)}</p>
                  </div>
                </>
              );
            })
          }
        </div>
      </div>) : null}

    </main>
  );
}
