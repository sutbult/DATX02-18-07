import Html exposing (..)
import Html.Events exposing (onClick)

type Msg = Foo Int | Bar Float

type alias Model =
    { foo : Int
    , bar : Float
    }

main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }

init : (Model, Cmd Msg)
init = (Model 1 2, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Foo foo ->
            (Model foo (.bar model), Cmd.none)

        Bar bar ->
            (Model (.foo model) bar, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

view : Model -> Html.Html Msg
view model =
    div []
        [ p [onClick (Foo 5)]
            [ text (toString (.foo model))
            , br [] []
            , text (toString (.bar model))
            ]
        ]
