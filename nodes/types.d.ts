export type StatusPayload = {
    /**
     * Status of the command bar
     */
    status: 'success' | 'error' | 'loading';
    /**
     * Status message to be shown in command bar status
     * Default : Success!
     */
    message: string;
}

export type CardPayload = {
    /**
     * whether sends back info for dashboard card or web card.
     */
    mode: "tab" | "web";
    /**
     * whether opens as expanded or collapsed.
     */
    display: "expanded" | "collapsed";
    /**
     * width of module when opened in a new card.
     * not important in new card UI
     */
    moduleWidth: int; // defaults to 15
    top: {
        icon: "chevron-right",
        /**
         * title text of the card 
         */
        text: string,
    },
    middle: {
        /**
         * Url of dashboard or the web view
         * in case of dash card, this is "/ui"
         */
        url: string,
        /**
         * Tab Id of dashboard
         * only in case of dash card
         */
        tab: string, 
    },
    bottom: {
        /**
         * Whether bottom section of visible or not.
         */
        visible: boolean, //default : false
        /**
         * Deprecated
         */
        actionItems: [string],
    },

}

export type BotResponse = {
    /**
     * Unique UUID that's sent from the client itself
     * to identify an unique task end to end
     */
    _taskid : string;
    /**
     * Type of Response - can either be a card or a response
     */
    type : "card" | "status";
    /**
     * Main payload containing response content
     */
    payload : StatusPayload | CardPayload

}