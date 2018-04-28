module AcceptedBids.Types exposing (..)

import BidList.Types as BidListTypes

type alias Model =
    { bidList : BidListTypes.Model
    }

type Msg
    = ToBidList BidListTypes.Msg
