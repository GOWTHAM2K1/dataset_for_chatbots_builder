"use client";

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: `${process.env.NEXT_PUBLIC_OPENAI_KEY}`, dangerouslyAllowBrowser: true, });

export default function Home() {


  async function query(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = event.target.result;
        try {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/distil-whisper/distil-large-v2",
            {
              headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY}` },
              method: "POST",
              body: data,
            }
          );
          const result = await response.json();
          resolve(result);
        } catch (error) {
          reject(error);
           alert(`Error while sending the file:${error}`);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  const create = async () => {
    const inputElement = document.getElementById('fileupload');

    if (inputElement instanceof HTMLInputElement && inputElement.files.length > 0) {
      const selectedFile = inputElement.files[0];
      query(selectedFile)
        .then(async (response) => {
          const value = await JSON.stringify(response);

          const jsonObject = await JSON.parse(value);
          conversion(jsonObject.text);
        })
        .catch((error) => {
          alert(`Error while sending the file:${error}`);
        });
    } else {
      console.error("No file selected or element with ID 'fileupload' not found.");
    }
  }

  const conversion = async (value: object) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: `Convert the following sentence in question and answer format the statement is as follows make sure to return all the text-content and also add <br> tag after each question before answer : ${value}` }],
      model: "gpt-3.5-turbo",

    });
    // console.log(value)
    console.log(completion.choices[0].message.content)
    const insertDataTag = document.getElementById('output_area')
    insertDataTag!.innerHTML = `${completion.choices[0].message.content}`
  }

  const download = async () => {
    const paragraph = document.getElementById('output_area');
    const downloadButton = document.getElementById('downloadButton');
    const textContent = paragraph.textContent;

    // Create a Blob (Binary Large Object) from the text content
    const blob = new Blob([textContent], { type: 'text/plain' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-content.txt'; // Specify the file name
    a.style.display = 'none';

    // Append the anchor element to the document and trigger a click event
    document.body.appendChild(a);
    a.click();

    // Remove the anchor element
    document.body.removeChild(a);

  }

  return (
    <main className="z-10 h-screen w-screen p-8 bg-[#f4f6f7]">
      <div className="w-full text-center "><h1 className=" font-semibold text-3xl text-slate-900 text-center mb-5 shadow-xl">Chat Bot Builder</h1></div>

      <div className="flex max-md:flex-col gap-2">
        <div className="flex-column left-0 h-full w-full md:w-[50%] bg-[#f4f6f7] text-center shadow-xl">
          <h1 className=" font-semibold text-xl w-full text-slate-900 text-center mt-5 mb-3">Please upload the audio file</h1>
          <div className="flex-col">
            <input className="max-md:w-[80vw] overflow-hidden text-center justify-center bg-[#f4f6f7] border rounded-md border-[#8da9b6] m-2" type="file" id='fileupload'></input>
            <button className="bg-[#f4f6f7] border rounded-md border-[#b4cdda] p-1 shadow-xl hover:bg-[#bcdbeb] m-4" onClick={create}>Submit</button>
          </div>

        </div>
        <div className="flex-column left-0 h-full w-full md:w-[50%] bg-[#f4f6f7] text-center shadow-xl">
          <h1 className=" font-semibold text-xl w-full text-slate-900 text-center mt-5 mb-2">Output from the uploaded file</h1>

          <p className="text-left p-3 pl-8" id="output_area"></p>
          <button id ="downloadButton" className="bg-[#f4f6f7] border rounded-md border-[#b4cdda] p-2 shadow-xl hover:bg-[#bcdbeb] m-4" onClick={download}>Download transcript</button>


        </div>
      </div>
    </main>
  );
}
