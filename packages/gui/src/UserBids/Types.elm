module UserBids.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import BidList.Types as BidListTypes

type alias Model =
    { bidList : BidListTypes.Model
    }

type Msg
    = ToBidList BidListTypes.Msg
    | SetBids (List Bid)
    | NotifyBidChanges (List Bid)


mapBidListCmd : BidListTypes.Msg -> Msg
mapBidListCmd msg =
    case msg of
        BidListTypes.SetBids bids ->
            SetBids bids

        subMsg ->
            ToBidList subMsg
