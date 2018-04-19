module UserBids.State exposing (..)

import Platform.Cmd

import Bid.Types exposing
    ( Bid
    , Value
    , Status(Pending, Finished)
    , statusChanged
    , currencyName
    , amountString
    )
import BidList.Types as BidListTypes
import BidList.State as BidListState
import UserBids.Types exposing (..)
import Ports
import Utils.State exposing
    ( foldMsg
    )


init : (Model, Cmd Msg)
init =
    let
        (bidListModel, bidListCmd) = BidListState.init True "getUserBids"
    in
        (   { bidList = bidListModel
            }
        , Cmd.batch
            [ Platform.Cmd.map mapBidListCmd bidListCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToBidList subMsg ->
            let
                (subModel, subCmd) = BidListState.update subMsg (.bidList model)
            in
                ({model | bidList = subModel}, Platform.Cmd.map mapBidListCmd subCmd)

        SetBids bids ->
            foldMsg update model
                [ NotifyBidChanges bids
                , ToBidList <| BidListTypes.SetBids bids
                ]

        NotifyBidChanges newBids ->
            let
                oldBids = model.bidList.table.bids
            in
                (model, notifyBidChanges oldBids newBids)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToBidList
            <| BidListState.subscriptions model.bidList
        ]


notifyBidChanges : List Bid -> List Bid -> Cmd Msg
notifyBidChanges old new =
    let
        changedBids = statusChanged old new
    in
        Cmd.batch
            [ notifyPending  changedBids
            , notifyFinished changedBids
            ]


notifyPending : List Bid -> Cmd Msg
notifyPending =
    notifyStatus Pending "A bid has been accepted"


notifyFinished : List Bid -> Cmd Msg
notifyFinished =
    notifyStatus Finished "An accepted bid has been processed"


notifyStatus
    :  Status
    -> String
    -> List Bid
    -> Cmd Msg
notifyStatus status title =
    let
        isPending bid = bid.status == status
        toMessage bid =
            Ports.notify
                ( title
                , bidToMessage bid
                )
    in
        Cmd.batch
            << List.map toMessage
            << List.filter isPending


bidToMessage : Bid -> String
bidToMessage bid =
    let
        from = valueToMessage bid.from
        to = valueToMessage bid.to
    in
        "\n" ++ from ++ "  \x21e8  " ++ to


valueToMessage : Value -> String
valueToMessage value =
    let
        currency = currencyName value.currency
        amount = amountString value
    in
        currency ++ ": " ++ amount
