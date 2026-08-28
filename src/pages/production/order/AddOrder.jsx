
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

import FormInput from "../../../components/form/FormInput";
import Button from "../../../components/Button";
import api from "../../../api/axios";

// =========================================================
// BACKEND URL
// =========================================================

const SERVER_URL = "https://mosach-erp-server.onrender.com";

// =========================================================
// IMAGE URL HELPER
// =========================================================

const getImageUrl = (imageurl) => {

    if (!imageurl) {
        return "";
    }

    const url = String(imageurl).trim();

    if (!url) {
        return "";
    }

    // Already complete URL
    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    // Remove duplicate slash
    if (url.startsWith("/")) {
        return `${SERVER_URL}${url}`;
    }

    return `${SERVER_URL}/${url}`;
};


// =========================================================
// ADD ORDER
// =========================================================

const AddOrder = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    // =====================================================
    // REFS
    // =====================================================

    const articleRef = useRef(null);
    const sizeGroupRef = useRef(null);
    const sizeRef = useRef(null);
    const colorRef = useRef(null);
    const qtyRef = useRef(null);

    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    // =====================================================
    // MASTER DATA
    // =====================================================

    const [salesPersons, setSalesPersons] = useState([]);
    const [articles, setArticles] = useState([]);

    const [variants, setVariants] = useState([]);

    // =====================================================
    // ARTICLE IMAGE
    // =====================================================

    const [articleImage, setArticleImage] = useState("");

    // =====================================================
    // ORDER HEADER
    // =====================================================

    const [formData, setFormData] = useState({
        orderno: "",
        orderdate: new Date().toISOString().split("T")[0],
        salespersonid: ""
    });

    // =====================================================
    // CURRENT ARTICLE
    // =====================================================

    const [selectedArticle, setSelectedArticle] = useState("");
    const [selectedSizeGroup, setSelectedSizeGroup] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [qty, setQty] = useState(1);

    // =====================================================
    // ORDER DETAILS
    // =====================================================

    const [details, setDetails] = useState([]);

    // =====================================================
    // GET SALESPERSONS
    // =====================================================

    const getSalesPersons = async () => {

        try {

            const res = await api.get("/salesperson");

            console.log(
                "SALESPERSON RESPONSE:",
                res.data
            );

            const data =
                Array.isArray(res.data)
                    ? res.data
                    : res.data?.data || [];

            setSalesPersons(data);

        } catch (error) {

            console.error(
                "GET SALESPERSON ERROR:",
                error
            );

            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "Unable to load salespersons",
                "error"
            );
        }
    };

    // =====================================================
    // GET ARTICLES
    // =====================================================

    const getArticles = async () => {

        try {

            const res = await api.get(
                "/article/getallarticles"
            );

            console.log(
                "ARTICLES RESPONSE:",
                res.data
            );

            const data =
                Array.isArray(res.data)
                    ? res.data
                    : res.data?.data || [];

            setArticles(data);

        } catch (error) {

            console.error(
                "GET ARTICLES ERROR:",
                error
            );

            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "Unable to load articles",
                "error"
            );
        }
    };

    // =====================================================
    // GET VARIANTS
    // =====================================================

    const getVariants = async (articleid) => {

        if (!articleid) {
            return [];
        }

        try {

            const res = await api.get(
                `/article/getvariants/${articleid}`
            );

            console.log(
                `VARIANTS FOR ARTICLE ${articleid}:`,
                res.data
            );

            let data = [];

            if (Array.isArray(res.data)) {

                data = res.data;

            } else if (
                Array.isArray(res.data?.data)
            ) {

                data = res.data.data;

            } else if (
                Array.isArray(res.data?.variants)
            ) {

                data = res.data.variants;

            } else if (
                Array.isArray(
                    res.data?.data?.variants
                )
            ) {

                data = res.data.data.variants;
            }

            return data;

        } catch (error) {

            console.error(
                "GET VARIANTS ERROR:",
                error
            );

            return [];
        }
    };

    // =====================================================
    // GET ARTICLE IMAGE
    // =====================================================

    const getArticleImage = async (articleid) => {

        if (!articleid) {

            setArticleImage("");

            return "";
        }

        try {

            setImageLoading(true);

            console.log(
                "===================================="
            );

            console.log(
                "GETTING ARTICLE IMAGE:",
                articleid
            );

            const res = await api.get(
                `/article/getimages/${articleid}`
            );

            console.log(
                "IMAGE API RESPONSE:",
                res.data
            );

            // -------------------------------------------------
            // Normalize response
            // -------------------------------------------------

            let imageData = res.data;

            // { data: {...} }
            if (
                imageData?.data &&
                !Array.isArray(imageData.data)
            ) {

                imageData = imageData.data;
            }

            // { image: {...} }
            if (
                imageData?.image &&
                typeof imageData.image === "object"
            ) {

                imageData = imageData.image;
            }

            // Array response
            if (Array.isArray(imageData)) {

                // Find primary image first
                imageData =
                    imageData.find(
                        item =>
                            Number(item.isprimary) === 1
                    ) ||
                    imageData[0] ||
                    {};
            }

            console.log(
                "NORMALIZED IMAGE DATA:",
                imageData
            );

            // -------------------------------------------------
            // Get image path
            // -------------------------------------------------

            const rawImageUrl =
                imageData?.imageurl ||
                imageData?.image_url ||
                imageData?.imagepath ||
                imageData?.url ||
                "";

            console.log(
                "RAW IMAGE URL:",
                rawImageUrl
            );

            if (!rawImageUrl) {

                console.warn(
                    "NO IMAGE URL FOUND FOR ARTICLE:",
                    articleid
                );

                setArticleImage("");

                return "";
            }

            // -------------------------------------------------
            // Final URL
            // -------------------------------------------------

            const finalImageUrl =
                getImageUrl(rawImageUrl);

            console.log(
                "FINAL IMAGE URL:",
                finalImageUrl
            );

            setArticleImage(
                finalImageUrl
            );

            console.log(
                "===================================="
            );

            return finalImageUrl;

        } catch (error) {

            console.error(
                "GET ARTICLE IMAGE ERROR:",
                error
            );

            console.error(
                "IMAGE STATUS:",
                error.response?.status
            );

            console.error(
                "IMAGE ERROR DATA:",
                error.response?.data
            );

            setArticleImage("");

            return "";

        } finally {

            setImageLoading(false);
        }
    };

    // =====================================================
    // GET ORDER FOR EDIT
    // =====================================================

    const getOrder = async () => {

        try {

            setLoading(true);

            const res = await api.get(
                `/order/${id}`
            );

            console.log(
                "GET ORDER RESPONSE:",
                res.data
            );

            const order =
                res.data?.data ||
                res.data;

            console.log(
                "ORDER OBJECT:",
                order
            );

            // -------------------------------------------------
            // HEADER
            // -------------------------------------------------

            setFormData({

                orderno:
                    order.orderno || "",

                orderdate:
                    order.orderdate
                        ? String(
                            order.orderdate
                        ).substring(0, 10)
                        : "",

                salespersonid:
                    order.salespersonid
                        ? String(
                            order.salespersonid
                        )
                        : ""
            });

            // -------------------------------------------------
            // DETAILS
            // -------------------------------------------------

            if (
                !Array.isArray(order.details) ||
                order.details.length === 0
            ) {

                setDetails([]);

                return;
            }

            // -------------------------------------------------
            // ARTICLE IDS
            // -------------------------------------------------

            const articleIds = [
                ...new Set(
                    order.details
                        .map(
                            item =>
                                item.articleid
                        )
                        .filter(Boolean)
                )
            ];

            // -------------------------------------------------
            // LOAD VARIANTS
            // -------------------------------------------------

            const variantMap = {};

            for (
                const articleid of articleIds
            ) {

                const articleVariants =
                    await getVariants(
                        articleid
                    );

                variantMap[
                    String(articleid)
                ] = articleVariants;
            }

            // -------------------------------------------------
            // LOAD ARTICLE IMAGES
            // -------------------------------------------------

            const imageMap = {};

            for (
                const articleid of articleIds
            ) {

                const existingImage =
                    order.details.find(
                        item =>
                            String(
                                item.articleid
                            ) ===
                            String(articleid) &&
                            item.imageurl
                    );

                if (
                    existingImage?.imageurl
                ) {

                    imageMap[
                        String(articleid)
                    ] =
                        getImageUrl(
                            existingImage.imageurl
                        );

                } else {

                    imageMap[
                        String(articleid)
                    ] =
                        await getArticleImage(
                            articleid
                        );
                }
            }

            // -------------------------------------------------
            // NORMALIZE DETAILS
            // -------------------------------------------------

            const normalizedDetails =
                order.details.map(
                    (item) => {

                        const articleVariants =
                            variantMap[
                                String(
                                    item.articleid
                                )
                            ] || [];

                        // -------------------------------------------------
                        // Variant ID
                        // -------------------------------------------------

                        let variantid =
                            item.variantid ||
                            item.variant_id ||
                            null;

                        // -------------------------------------------------
                        // Find variant
                        // -------------------------------------------------

                        if (!variantid) {

                            const foundVariant =
                                articleVariants.find(
                                    variant =>

                                        String(
                                            variant.articleid
                                        ) ===
                                        String(
                                            item.articleid
                                        ) &&

                                        String(
                                            variant.sizegroupid
                                        ) ===
                                        String(
                                            item.sizegroupid
                                        ) &&

                                        String(
                                            variant.sizeid
                                        ) ===
                                        String(
                                            item.sizeid
                                        ) &&

                                        String(
                                            variant.colorid
                                        ) ===
                                        String(
                                            item.colorid
                                        )
                                );

                            if (
                                foundVariant
                            ) {

                                variantid =
                                    foundVariant.variantid;
                            }
                        }

                        // -------------------------------------------------
                        // Exact variant
                        // -------------------------------------------------

                        const exactVariant =
                            articleVariants.find(
                                variant =>
                                    Number(
                                        variant.variantid
                                    ) ===
                                    Number(
                                        variantid
                                    )
                            );

                        // -------------------------------------------------
                        // Image
                        // -------------------------------------------------

                        const imageurl =
                            item.imageurl
                                ? getImageUrl(
                                    item.imageurl
                                )
                                : imageMap[
                                    String(
                                        item.articleid
                                    )
                                ] || "";

                        return {

                            variantid:
                                variantid
                                    ? Number(
                                        variantid
                                    )
                                    : null,

                            articleid:
                                Number(
                                    item.articleid
                                ),

                            articleno:
                                item.articleno ||
                                item.article_no ||
                                exactVariant?.articleno ||
                                "",

                            articlename:
                                item.articlename ||
                                item.article_name ||
                                exactVariant?.articlename ||
                                "",

                            genderid:
                                item.genderid ||
                                exactVariant?.genderid ||
                                null,

                            gender:
                                item.gender ||
                                exactVariant?.gender ||
                                "",

                            colorid:
                                Number(
                                    item.colorid ||
                                    exactVariant?.colorid ||
                                    0
                                ),

                            color:
                                item.color ||
                                exactVariant?.color ||
                                "",

                            sizegroupid:
                                Number(
                                    item.sizegroupid ||
                                    exactVariant?.sizegroupid ||
                                    0
                                ),

                            sizegroup:
                                item.sizegroup ||
                                item.size_group ||
                                item.sizegroupname ||
                                exactVariant?.sizegroup ||
                                exactVariant?.size_group ||
                                exactVariant?.sizegroupname ||
                                "",

                            sizeid:
                                Number(
                                    item.sizeid ||
                                    exactVariant?.sizeid ||
                                    0
                                ),

                            size:
                                item.size ||
                                item.sizename ||
                                exactVariant?.size ||
                                exactVariant?.sizename ||
                                "",

                            qty:
                                Number(
                                    item.qty
                                ) || 0,

                            imageurl
                        };
                    }
                );

            console.log(
                "NORMALIZED ORDER DETAILS:",
                normalizedDetails
            );

            setDetails(
                normalizedDetails
            );

        } catch (error) {

            console.error(
                "GET ORDER ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "DATA:",
                error.response?.data
            );

            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "Unable to load order",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        getSalesPersons();

        getArticles();

        if (id) {

            getOrder();
        }

    }, [id]);

    // =====================================================
    // HEADER CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // =====================================================
    // ARTICLE CHANGE
    // =====================================================

    const handleArticleChange = async (e) => {

        const articleid =
            e.target.value;

        setSelectedArticle(
            articleid
        );

        // Reset
        setSelectedSizeGroup("");
        setSelectedSize("");
        setSelectedColor("");
        setQty(1);
        setVariants([]);
        setArticleImage("");

        if (!articleid) {

            return;
        }

        try {

            setLoading(true);

            // -------------------------------------------------
            // GET VARIANTS
            // -------------------------------------------------

            const variantData =
                await getVariants(
                    articleid
                );

            console.log(
                "NORMALIZED VARIANTS:",
                variantData
            );

            setVariants(
                variantData
            );

            // -------------------------------------------------
            // GET IMAGE
            // -------------------------------------------------

            await getArticleImage(
                articleid
            );

            // -------------------------------------------------
            // NO VARIANT
            // -------------------------------------------------

            if (
                variantData.length === 0
            ) {

                Swal.fire(
                    "Information",
                    "No variants found for this article.",
                    "info"
                );

                return;
            }

            // -------------------------------------------------
            // FOCUS SIZE GROUP
            // -------------------------------------------------

            setTimeout(() => {

                sizeGroupRef.current?.focus();

            }, 100);

        } catch (error) {

            console.error(
                "GET ARTICLE ERROR:",
                error
            );

            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "Unable to load article",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // SELECTED ARTICLE OBJECT
    // =====================================================

    const selectedArticleObject =
        articles.find(
            item =>
                String(
                    item.articleid
                ) ===
                String(
                    selectedArticle
                )
        );

    // =====================================================
    // SIZE GROUPS
    // =====================================================

    const sizeGroups = [
        ...new Map(

            variants
                .filter(
                    item =>
                        item.sizegroupid !==
                            undefined &&
                        item.sizegroupid !==
                            null
                )
                .map(item => {

                    const id =
                        item.sizegroupid;

                    const name =
                        item.sizegroup ||
                        item.size_group ||
                        item.sizegroupname ||
                        `Size Group ${id}`;

                    return [
                        String(id),
                        {
                            sizegroupid:
                                Number(id),

                            sizegroup:
                                name
                        }
                    ];
                })

        ).values()
    ];

    // =====================================================
    // SIZE GROUP CHANGE
    // =====================================================

    const handleSizeGroupChange = (e) => {

        const value =
            e.target.value;

        setSelectedSizeGroup(
            value
        );

        setSelectedSize("");
        setSelectedColor("");
        setQty(1);

        if (value) {

            setTimeout(() => {

                sizeRef.current?.focus();

            }, 100);
        }
    };

    // =====================================================
    // SIZES
    // =====================================================

    const sizes = [
        ...new Map(

            variants

                .filter(
                    item =>
                        String(
                            item.sizegroupid
                        ) ===
                        String(
                            selectedSizeGroup
                        )
                )

                .filter(
                    item =>
                        item.sizeid !==
                            undefined &&
                        item.sizeid !==
                            null
                )

                .map(item => {

                    const id =
                        item.sizeid;

                    const name =
                        item.size ||
                        item.sizename ||
                        `Size ${id}`;

                    return [
                        String(id),
                        {
                            sizeid:
                                Number(id),

                            size:
                                name
                        }
                    ];
                })

        ).values()
    ];

    // =====================================================
    // SIZE CHANGE
    // =====================================================

    const handleSizeChange = (e) => {

        const value =
            e.target.value;

        setSelectedSize(
            value
        );

        setSelectedColor("");
        setQty(1);

        if (value) {

            setTimeout(() => {

                colorRef.current?.focus();

            }, 100);
        }
    };

    // =====================================================
    // COLORS
    // =====================================================

    const colors = [
        ...new Map(

            variants

                .filter(
                    item =>
                        String(
                            item.sizegroupid
                        ) ===
                        String(
                            selectedSizeGroup
                        )
                )

                .filter(
                    item =>
                        String(
                            item.sizeid
                        ) ===
                        String(
                            selectedSize
                        )
                )

                .filter(
                    item =>
                        item.colorid !==
                            undefined &&
                        item.colorid !==
                            null
                )

                .map(item => {

                    const id =
                        item.colorid;

                    const name =
                        item.color ||
                        item.colorname ||
                        `Color ${id}`;

                    return [
                        String(id),
                        {
                            colorid:
                                Number(id),

                            color:
                                name
                        }
                    ];
                })

        ).values()
    ];

    // =====================================================
    // COLOR CHANGE
    // =====================================================

    const handleColorChange = (e) => {

        const value =
            e.target.value;

        setSelectedColor(
            value
        );

        if (value) {

            setTimeout(() => {

                qtyRef.current?.focus();

                qtyRef.current?.select();

            }, 100);
        }
    };

    // =====================================================
    // ADD ARTICLE
    // =====================================================

    const addArticle = () => {

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!selectedArticle) {

            Swal.fire(
                "Error",
                "Please select Article",
                "error"
            );

            articleRef.current?.focus();

            return;
        }

        if (!selectedSizeGroup) {

            Swal.fire(
                "Error",
                "Please select Size Group",
                "error"
            );

            sizeGroupRef.current?.focus();

            return;
        }

        if (!selectedSize) {

            Swal.fire(
                "Error",
                "Please select Size",
                "error"
            );

            sizeRef.current?.focus();

            return;
        }

        if (!selectedColor) {

            Swal.fire(
                "Error",
                "Please select Color",
                "error"
            );

            colorRef.current?.focus();

            return;
        }

        if (
            !qty ||
            Number(qty) <= 0
        ) {

            Swal.fire(
                "Error",
                "Quantity must be greater than 0",
                "error"
            );

            qtyRef.current?.focus();

            return;
        }

        // -------------------------------------------------
        // FIND EXACT VARIANT
        // -------------------------------------------------

        const variant =
            variants.find(
                item =>

                    String(
                        item.sizegroupid
                    ) ===
                    String(
                        selectedSizeGroup
                    ) &&

                    String(
                        item.sizeid
                    ) ===
                    String(
                        selectedSize
                    ) &&

                    String(
                        item.colorid
                    ) ===
                    String(
                        selectedColor
                    )
            );

        if (!variant) {

            Swal.fire(
                "Error",
                "Selected variant not found",
                "error"
            );

            return;
        }

        // -------------------------------------------------
        // VARIANT ID
        // -------------------------------------------------

        if (
            !variant.variantid
        ) {

            Swal.fire(
                "Error",
                "Variant ID is missing",
                "error"
            );

            console.error(
                "INVALID VARIANT:",
                variant
            );

            return;
        }

        // -------------------------------------------------
        // DISPLAY OBJECTS
        // -------------------------------------------------

        const sizeGroupObject =
            sizeGroups.find(
                item =>
                    String(
                        item.sizegroupid
                    ) ===
                    String(
                        selectedSizeGroup
                    )
            );

        const sizeObject =
            sizes.find(
                item =>
                    String(
                        item.sizeid
                    ) ===
                    String(
                        selectedSize
                    )
            );

        const colorObject =
            colors.find(
                item =>
                    String(
                        item.colorid
                    ) ===
                    String(
                        selectedColor
                    )
            );

        // -------------------------------------------------
        // ARTICLE
        // -------------------------------------------------

        const articleNo =
            variant.articleno ||
            variant.article_no ||
            selectedArticleObject?.articleno ||
            selectedArticleObject?.article_no ||
            "";

        const articleName =
            variant.articlename ||
            variant.article_name ||
            selectedArticleObject?.articlename ||
            selectedArticleObject?.article_name ||
            "";

        // -------------------------------------------------
        // SIZE GROUP
        // -------------------------------------------------

        const sizeGroupName =
            variant.sizegroup ||
            variant.size_group ||
            variant.sizegroupname ||
            sizeGroupObject?.sizegroup ||
            `Size Group ${selectedSizeGroup}`;

        // -------------------------------------------------
        // SIZE
        // -------------------------------------------------

        const sizeName =
            variant.size ||
            variant.sizename ||
            sizeObject?.size ||
            `Size ${selectedSize}`;

        // -------------------------------------------------
        // COLOR
        // -------------------------------------------------

        const colorName =
            variant.color ||
            variant.colorname ||
            colorObject?.color ||
            `Color ${selectedColor}`;

        // -------------------------------------------------
        // DUPLICATE
        // -------------------------------------------------

        const alreadyExists =
            details.some(
                item =>

                    Number(
                        item.articleid
                    ) ===
                    Number(
                        selectedArticle
                    ) &&

                    Number(
                        item.sizegroupid
                    ) ===
                    Number(
                        selectedSizeGroup
                    ) &&

                    Number(
                        item.sizeid
                    ) ===
                    Number(
                        selectedSize
                    ) &&

                    Number(
                        item.colorid
                    ) ===
                    Number(
                        selectedColor
                    )
            );

        if (alreadyExists) {

            Swal.fire(
                "Already Added",
                "This article, size and color is already added.",
                "warning"
            );

            return;
        }

        // -------------------------------------------------
        // NEW DETAIL
        // -------------------------------------------------

        const newDetail = {

            variantid:
                Number(
                    variant.variantid
                ),

            articleid:
                Number(
                    selectedArticle
                ),

            articleno:
                articleNo,

            articlename:
                articleName,

            // ⭐ IMAGE
            imageurl:
                articleImage || "",

            genderid:
                variant.genderid ||
                null,

            gender:
                variant.gender ||
                "",

            sizegroupid:
                Number(
                    selectedSizeGroup
                ),

            sizegroup:
                sizeGroupName,

            sizeid:
                Number(
                    selectedSize
                ),

            size:
                sizeName,

            colorid:
                Number(
                    selectedColor
                ),

            color:
                colorName,

            qty:
                Number(qty)
        };

        console.log(
            "NEW ORDER DETAIL:",
            newDetail
        );

        setDetails(
            prev => [
                ...prev,
                newDetail
            ]
        );

        // -------------------------------------------------
        // RESET
        // -------------------------------------------------

        setSelectedSizeGroup("");
        setSelectedSize("");
        setSelectedColor("");
        setQty(1);

        setTimeout(() => {

            sizeGroupRef.current?.focus();

        }, 100);
    };

    // =====================================================
    // UPDATE QTY
    // =====================================================

    const updateQty = (
        index,
        value
    ) => {

        const newQty =
            Number(value);

        setDetails(
            prev =>
                prev.map(
                    (item, i) =>
                        i === index
                            ? {
                                ...item,
                                qty:
                                    newQty > 0
                                        ? newQty
                                        : 0
                            }
                            : item
                )
        );
    };

    // =====================================================
    // REMOVE DETAIL
    // =====================================================

    const removeDetail = (
        index
    ) => {

        setDetails(
            prev =>
                prev.filter(
                    (_, i) =>
                        i !== index
                )
        );
    };

    // =====================================================
    // TOTAL QTY
    // =====================================================

    const totalQty =
        details.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.qty || 0
                ),
            0
        );

    // =====================================================
    // VALIDATE
    // =====================================================

    const validate = () => {

        if (
            !formData.orderdate
        ) {

            Swal.fire(
                "Error",
                "Order Date is required",
                "error"
            );

            return false;
        }

        if (
            !formData.salespersonid
        ) {

            Swal.fire(
                "Error",
                "Salesperson is required",
                "error"
            );

            return false;
        }

        if (
            !details ||
            details.length === 0
        ) {

            Swal.fire(
                "Error",
                "Please add at least one article",
                "error"
            );

            return false;
        }

        for (
            const item of details
        ) {

            if (
                !item.variantid ||
                Number(
                    item.variantid
                ) <= 0
            ) {

                Swal.fire(
                    "Error",
                    "Variant ID is missing for one of the order items.",
                    "error"
                );

                console.error(
                    "MISSING VARIANT ID:",
                    item
                );

                return false;
            }

            if (
                !item.articleid ||
                !item.sizegroupid ||
                !item.sizeid ||
                !item.colorid
            ) {

                Swal.fire(
                    "Error",
                    "Article variant information is incomplete",
                    "error"
                );

                return false;
            }

            if (
                !item.qty ||
                Number(
                    item.qty
                ) <= 0
            ) {

                Swal.fire(
                    "Error",
                    "Quantity must be greater than 0",
                    "error"
                );

                return false;
            }
        }

        return true;
    };

    // =====================================================
    // SAVE / UPDATE ORDER
    // =====================================================

    const handleSubmit =
        async () => {

            if (!validate()) {
                return;
            }

            try {

                setLoading(true);

                const payload = {

                    orderdate:
                        formData.orderdate,

                    salespersonid:
                        Number(
                            formData.salespersonid
                        ),

                    details:
                        details.map(
                            item => ({

                                variantid:
                                    Number(
                                        item.variantid
                                    ),

                                articleid:
                                    Number(
                                        item.articleid
                                    ),

                                sizegroupid:
                                    Number(
                                        item.sizegroupid
                                    ),

                                sizeid:
                                    Number(
                                        item.sizeid
                                    ),

                                colorid:
                                    Number(
                                        item.colorid
                                    ),

                                qty:
                                    Number(
                                        item.qty
                                    )
                            })
                        )
                };

                console.log(
                    "================================"
                );

                console.log(
                    "ORDER SAVE PAYLOAD:",
                    JSON.stringify(
                        payload,
                        null,
                        2
                    )
                );

                console.log(
                    "================================"
                );

                // -------------------------------------------------
                // UPDATE
                // -------------------------------------------------

                if (isEdit) {

                    await api.put(
                        `/order/${id}`,
                        payload
                    );

                    await Swal.fire(
                        "Success",
                        `Order ${
                            formData.orderno || ""
                        } Updated Successfully`,
                        "success"
                    );

                }

                // -------------------------------------------------
                // CREATE
                // -------------------------------------------------

                else {

                    const res =
                        await api.post(
                            "/order",
                            payload
                        );

                    console.log(
                        "ORDER CREATE RESPONSE:",
                        res.data
                    );

                    const createdOrderNo =
                        res.data?.data?.orderno ||
                        res.data?.orderno ||
                        "";

                    await Swal.fire(
                        "Success",
                        `Order ${
                            createdOrderNo
                        } Created Successfully`,
                        "success"
                    );
                }

                navigate(
                    "/production/order"
                );

            } catch (error) {

                console.error(
                    "ORDER SAVE ERROR:",
                    error
                );

                console.error(
                    "STATUS:",
                    error.response?.status
                );

                console.error(
                    "DATA:",
                    error.response?.data
                );

                Swal.fire(
                    "Error",
                    error.response?.data?.message ||
                    error.message ||
                    "Something went wrong",
                    "error"
                );

            } finally {

                setLoading(false);
            }
        };

    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                <div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Order Entry
                    </h1>

                    <p className="text-slate-500 mt-1 text-sm sm:text-base">

                        {isEdit
                            ? "Edit Order"
                            : "Create New Order"}

                    </p>

                </div>

                <Button
                    variant="warning"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="w-full sm:w-auto justify-center"
                >

                    <FaArrowLeft />

                    Back

                </Button>

            </div>

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

                {/* =================================================
                    ORDER INFORMATION
                ================================================= */}

                <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

                    <h2 className="text-lg font-semibold text-white">
                        Order Information
                    </h2>

                </div>

                <div className="p-4 sm:p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                        {/* ORDER NO */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Order No.
                            </label>

                            <input
                                type="text"
                                value={
                                    isEdit
                                        ? (
                                            formData.orderno ||
                                            "Loading..."
                                        )
                                        : "Auto Generate"
                                }
                                disabled
                                className="w-full border rounded-lg px-3 py-2.5 bg-gray-100 text-slate-500"
                            />

                        </div>

                        {/* DATE */}

                        <FormInput
                            label="Order Date"
                            type="date"
                            name="orderdate"
                            value={
                                formData.orderdate
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        {/* SALESPERSON */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">

                                Salesperson

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <select
                                name="salespersonid"
                                value={
                                    formData.salespersonid
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    loading
                                }
                                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >

                                <option value="">
                                    Select Salesperson
                                </option>

                                {salesPersons.map(
                                    item => (

                                        <option
                                            key={
                                                item.salespersonid
                                            }
                                            value={
                                                item.salespersonid
                                            }
                                        >

                                            {
                                                item.salesperson
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ADD ARTICLE HEADER
                ================================================= */}

                <div className="border-t border-b px-4 sm:px-6 py-4 bg-slate-50">

                    <h2 className="text-lg font-semibold text-slate-800">
                        Add Article
                    </h2>

                </div>

                {/* =================================================
                    ADD ARTICLE
                ================================================= */}

                <div className="p-4 sm:p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                        {/* ARTICLE */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">

                                Article No.

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <div className="flex gap-3">

                                {/* ARTICLE SELECT */}

                                <select
                                    ref={
                                        articleRef
                                    }
                                    value={
                                        selectedArticle
                                    }
                                    onChange={
                                        handleArticleChange
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="flex-1 min-w-0 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >

                                    <option value="">
                                        Select Article
                                    </option>

                                    {articles.map(
                                        item => (

                                            <option
                                                key={
                                                    item.articleid
                                                }
                                                value={
                                                    item.articleid
                                                }
                                            >

                                                {
                                                    item.articleno
                                                }

                                                {" - "}

                                                {
                                                    item.articlename
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                                {/* =================================================
                                    ARTICLE IMAGE
                                ================================================= */}

                                <div className="w-20 h-20 border rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">

                                    {imageLoading ? (

                                        <div className="text-xs text-slate-400 text-center px-1">
                                            Loading...
                                        </div>

                                    ) : articleImage ? (

                                        <img
                                            src={
                                                articleImage
                                            }
                                            alt="Article"
                                            className="w-full h-full object-contain p-1"
                                            onLoad={() => {

                                                console.log(
                                                    "IMAGE LOADED SUCCESSFULLY:",
                                                    articleImage
                                                );

                                            }}
                                            onError={(e) => {

                                                console.error(
                                                    "IMAGE LOAD ERROR:",
                                                    articleImage
                                                );

                                                e.currentTarget.style.display =
                                                    "none";

                                                setArticleImage("");

                                            }}
                                        />

                                    ) : (

                                        <div className="text-xs text-slate-400 text-center px-1">
                                            No Image
                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>

                        {/* SIZE GROUP */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">

                                Size Group

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <select
                                ref={
                                    sizeGroupRef
                                }
                                value={
                                    selectedSizeGroup
                                }
                                onChange={
                                    handleSizeGroupChange
                                }
                                disabled={
                                    loading ||
                                    !selectedArticle ||
                                    sizeGroups.length === 0
                                }
                                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >

                                <option value="">
                                    Select Size Group
                                </option>

                                {sizeGroups.map(
                                    item => (

                                        <option
                                            key={
                                                item.sizegroupid
                                            }
                                            value={
                                                item.sizegroupid
                                            }
                                        >

                                            {
                                                item.sizegroup
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {/* SIZE */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">

                                Size

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <select
                                ref={
                                    sizeRef
                                }
                                value={
                                    selectedSize
                                }
                                onChange={
                                    handleSizeChange
                                }
                                disabled={
                                    loading ||
                                    !selectedSizeGroup ||
                                    sizes.length === 0
                                }
                                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >

                                <option value="">
                                    Select Size
                                </option>

                                {sizes.map(
                                    item => (

                                        <option
                                            key={
                                                item.sizeid
                                            }
                                            value={
                                                item.sizeid
                                            }
                                        >

                                            {
                                                item.size
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {/* COLOR */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">

                                Color

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <select
                                ref={
                                    colorRef
                                }
                                value={
                                    selectedColor
                                }
                                onChange={
                                    handleColorChange
                                }
                                disabled={
                                    loading ||
                                    !selectedSize ||
                                    colors.length === 0
                                }
                                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >

                                <option value="">
                                    Select Color
                                </option>

                                {colors.map(
                                    item => (

                                        <option
                                            key={
                                                item.colorid
                                            }
                                            value={
                                                item.colorid
                                            }
                                        >

                                            {
                                                item.color
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {/* QTY */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1">

                                Quantity

                                <span className="text-red-500 ml-1">
                                    *
                                </span>

                            </label>

                            <input
                                ref={
                                    qtyRef
                                }
                                type="number"
                                min="1"
                                value={
                                    qty
                                }
                                onChange={
                                    e =>
                                        setQty(
                                            e.target.value
                                        )
                                }
                                onKeyDown={
                                    e => {

                                        if (
                                            e.key ===
                                            "Enter"
                                        ) {

                                            e.preventDefault();

                                            addArticle();
                                        }

                                    }
                                }
                                disabled={
                                    loading ||
                                    !selectedColor
                                }
                                className="w-full border rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* ADD BUTTON */}

                        <div className="flex items-end">

                            <button
                                type="button"
                                onClick={
                                    addArticle
                                }
                                disabled={
                                    loading ||
                                    !selectedColor ||
                                    !qty
                                }
                                className="w-full py-2.5 bg-[#0A4B57] text-white rounded-lg hover:bg-[#083b44] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >

                                <FaPlus />

                                Add Article

                            </button>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ORDER DETAILS HEADER
                ================================================= */}

                <div className="border-t border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

                    <div className="flex items-center justify-between">

                        <h2 className="text-lg font-semibold text-white">
                            Order Details
                        </h2>

                        <div className="bg-white text-[#0A4B57] px-3 py-1.5 rounded-lg text-sm font-semibold">

                            Total Qty:
                            {" "}
                            {totalQty}

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ORDER DETAILS
                ================================================= */}

                <div className="p-4 sm:p-6">

                    {details.length === 0 ? (

                        <div className="border border-dashed rounded-lg p-8 text-center text-slate-500">

                            No articles added yet.

                        </div>

                    ) : (

                        <div className="overflow-x-auto border rounded-lg">

                            <table className="w-full text-sm">

                                <thead className="bg-slate-100">

                                    <tr>

                                        <th className="p-3 text-left">
                                            #
                                        </th>

                                        <th className="p-3 text-left">
                                            Image
                                        </th>

                                        <th className="p-3 text-left">
                                            Article No.
                                        </th>

                                        <th className="p-3 text-left">
                                            Size Group
                                        </th>

                                        <th className="p-3 text-left">
                                            Size
                                        </th>

                                        <th className="p-3 text-left">
                                            Color
                                        </th>

                                        <th className="p-3 text-center">
                                            Qty
                                        </th>

                                        <th className="p-3 text-center">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {details.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <tr
                                                key={`${item.variantid}-${index}`}
                                                className="border-t hover:bg-slate-50"
                                            >

                                                <td className="p-3">
                                                    {
                                                        index + 1
                                                    }
                                                </td>

                                                {/* IMAGE */}

                                                <td className="p-3">

                                                    <div className="w-14 h-14 border rounded-lg bg-white flex items-center justify-center overflow-hidden">

                                                        {item.imageurl ? (

                                                            <img
                                                                src={
                                                                    item.imageurl
                                                                }
                                                                alt={
                                                                    item.articleno ||
                                                                    "Article"
                                                                }
                                                                className="w-full h-full object-contain p-1"
                                                                onError={(e) => {

                                                                    console.error(
                                                                        "DETAIL IMAGE ERROR:",
                                                                        item.imageurl
                                                                    );

                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />

                                                        ) : (

                                                            <span className="text-xs text-slate-400">
                                                                No Image
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>

                                                {/* ARTICLE */}

                                                <td className="p-3">

                                                    <div className="font-medium text-slate-800">

                                                        {
                                                            item.articleno ||
                                                            "-"
                                                        }

                                                    </div>

                                                    {item.articlename && (

                                                        <div className="text-xs text-slate-500">

                                                            {
                                                                item.articlename
                                                            }

                                                        </div>

                                                    )}

                                                </td>

                                                {/* SIZE GROUP */}

                                                <td className="p-3">

                                                    {
                                                        item.sizegroup ||
                                                        `Size Group ${item.sizegroupid}`
                                                    }

                                                </td>

                                                {/* SIZE */}

                                                <td className="p-3">

                                                    {
                                                        item.size ||
                                                        "-"
                                                    }

                                                </td>

                                                {/* COLOR */}

                                                <td className="p-3">

                                                    {
                                                        item.color ||
                                                        "-"
                                                    }

                                                </td>

                                                {/* QTY */}

                                                <td className="p-3 text-center">

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            item.qty
                                                        }
                                                        onChange={
                                                            e =>
                                                                updateQty(
                                                                    index,
                                                                    e.target.value
                                                                )
                                                        }
                                                        className="w-24 border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />

                                                </td>

                                                {/* ACTION */}

                                                <td className="p-3 text-center">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeDetail(
                                                                index
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                    >

                                                        <FaTrash />

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                                <tfoot>

                                    <tr className="bg-slate-50 border-t">

                                        <td
                                            colSpan="6"
                                            className="p-3 text-right font-bold"
                                        >

                                            Total Quantity

                                        </td>

                                        <td className="p-3 text-center font-bold text-lg">

                                            {
                                                totalQty
                                            }

                                        </td>

                                        <td></td>

                                    </tr>

                                </tfoot>

                            </table>

                        </div>

                    )}

                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        disabled={
                            loading
                        }
                        className="w-full sm:w-40 py-2.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >

                        Cancel

                    </button>

                    <button
                        type="button"
                        onClick={
                            handleSubmit
                        }
                        disabled={
                            loading ||
                            details.length === 0
                        }
                        className="w-full sm:w-44 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {
                            loading
                                ? "Please Wait..."
                                : isEdit
                                    ? "Update Order"
                                    : "Save Order"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
};

export default AddOrder;

