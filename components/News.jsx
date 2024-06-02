"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

const News = () => {
  const [news, setNews] = useState([]);
  const countryRef = useRef();
  const categoryRef = useRef();
  let abortController = null;

  const getData = async (country = "in", category = null, extend = false) => {
    let url = `https://newsapi.org/v2/top-headlines?country=${country}${
      category ? "&category=" + category : ""
    }&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`;

    const cache = localStorage.getItem("cache");
    console.log(cache[url]);
    if (cache && cache[url]) {
      setNews(cache[url]);
      return;
    }

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    console.log(url);
    axios
      .get(url, {
        signal: abortController.signal,
      })
      .then((res) => {
        const data = {
          url: res.data.articles,
        };
        console.log(data);
        localStorage.setItem("cache", data);
        if (extend) {
          setNews([...news, ...res.data.articles]);
        } else setNews(res.data.articles);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    //create a event listerner for infinite scroll
    window.addEventListener("scroll", handleScroll);
    function handleScroll() {
      //check if the user has scrolled to the bottom of the page
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight
      )
        return;
      //fetch more data when the user has scrolled to the bottom of the page
      const country =
        countryRef.current.value.toLowerCase() === "choose country"
          ? "in"
          : countryRef.current.value.toLowerCase();
      const category =
        categoryRef.current.value === "Choose Category"
          ? null
          : categoryRef.current.value;
      getData(country, category, true);
    }
    return () => {
      //remove the event listener when the component is unmounted
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const refine = () => {
    getData(countryRef.current.value.toLowerCase(), categoryRef.current.value);
  };
  return (
    <>
      <span className="px-3 pt-4 flex items-center text-blue-700">
        <p>Filters</p>
      </span>
      <div className="flex">
        <span className="p-3 max-w-60">
          <label
            for="countries"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Select Country
          </label>
          <select
            ref={countryRef}
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option selected>Choose Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="IN">India</option>
          </select>
        </span>
        <span className="p-3 max-w-60">
          <label
            for="countries"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Select Category
          </label>
          <select
            ref={categoryRef}
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option selected>Choose Category</option>
            <option value="business">Business</option>
            <option value="entertainment">Entertainment</option>
            <option value="general">General</option>
            <option value="health">Health</option>
            <option value="science">Science</option>
            <option value="sports">Sports</option>
            <option value="technology">Technology</option>
          </select>
        </span>
        <span className="p-3 max-w-60 flex items-end">
          <button
            className=" py-2 px-4 rounded-md bg-blue-600 text-white"
            onClick={refine}
          >
            Apply
          </button>
        </span>
      </div>
      <h1 className="text-2xl font-semibold p-4">Top Headlines</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
        {news.map((article, index) => {
          return (
            <div key={index} className="border rounded-md shadow-md">
              <Image
                width={500}
                height={300}
                src={article.urlToImage || "/no-image.png"}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-md "
              />
              <div className="p-4 flex flex-col justify-between h-60">
                <h2 className="text-lg font-bold leading-snug">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {article.description && article.description.substring(0, 100)}
                  ...
                </p>
                <Link
                  href={article.url}
                  target="_blank"
                  className="text-white text-sm p-2 bg-blue-500 rounded-md mt-2 text-center w-fit"
                >
                  Read More
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default News;
