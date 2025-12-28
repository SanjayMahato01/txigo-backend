import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema({
    pageName: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    content: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true });

const PageContent= mongoose.models.PageContent || mongoose.model("PageContent", PageContentSchema);

export default PageContent;
