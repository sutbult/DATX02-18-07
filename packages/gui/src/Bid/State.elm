module Bid.State exposing
    ( notifyBidChanges
    )

import Bid.Types exposing
    ( Bid
    , Value
    , Status(Pending, Finished)
    , statusChanged
    , currencyName
    , amountString
    )

import Ports


notifyBidChanges : List Bid -> List Bid -> Cmd msg
notifyBidChanges old new =
    let
        changedBids = statusChanged old new
    in
        Cmd.batch
            [ notifyPending  changedBids
            , notifyFinished changedBids
            ]


notifyPending : List Bid -> Cmd msg
notifyPending =
    notifyStatus Pending "A bid has been accepted"


notifyFinished : List Bid -> Cmd msg
notifyFinished =
    notifyStatus Finished "An accepted bid has been processed"


notifyStatus
    :  Status
    -> String
    -> List Bid
    -> Cmd msg
notifyStatus status title =
    let
        isPending bid = bid.status == status
        toMessage bid =
            Debug.log "notify" Ports.notify
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
