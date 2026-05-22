const uploadFile = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        "http://localhost:5000/api/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    console.log(data);
};